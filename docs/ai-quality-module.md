# AI Quality Assessment Module — Technical Brief

**Two-Step Segmentation & Classification Production Pipeline**

## 1. System Overview & Architecture

The Quality Assessment Module is a containerized, backend-driven AI system engineered to inspect,
grade, and evaluate multi-seed maize crop samples. To resolve critical downscaling errors that
occur when passing wide-angle, high-resolution photos containing many seeds to a network trained
on single crops, the system implements a **Two-Step Edge Processing Pipeline**. Architectural
boundaries decouple consumer interface layers from heavy hardware dependencies, keeping core
compute isolated inside serverless microservices.

| Architectural Layer                      | Core Responsibilities & Components                                                                                                                                                                                               | Key Dependencies                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Frontend (Client Web/Mobile)             | Captures multi-seed crop samples on a high-contrast dark surface; dispatches binary payloads via stateless HTTP POST; renders objective grades, defect percentages, and financial valuations                                     | React / Flutter / Native JS, Axios / Fetch API               |
| Backend AI Engine (Serverless Container) | Receives images via a FastAPI gateway and executes OpenCV contour segmentation; processes extracted seed crops through an Ultralytics YOLOv8 classifier; computes defect matrices, determines batch grades, maps pricing metrics | Python 3.10 / FastAPI, OpenCV-Python, Ultralytics YOLOv8-cls |

## Models Used

Ishuko's AI module is a **classification** system, not a generative or retrieval system — there is
no LLM, embedding model, or knowledge base involved.

| Model                        | Role                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **YOLOv8-cls (Ultralytics)** | Classifies each individually-cropped kernel into one of five categories: `good_maize`, `insect_damage`, `moldy`, `broken`, `extraneous_matter`              |
| **OpenCV contour detection** | Not a learned model — a classical computer-vision segmentation step (Otsu thresholding + contour detection) that isolates each kernel before classification |

## Training Approach

Ishuko uses **supervised fine-tuning**, not RAG (Retrieval-Augmented Generation) — there is no
document corpus to retrieve from. A pretrained YOLOv8 classification backbone is fine-tuned on
labeled maize kernel images sourced from:

- [RoboFlow — Maize Seeds Quality Analysis](https://universe.roboflow.com/maize-seeds-analysis/maize-seeds-quality-analysis/browse?queryText=AVERAGE&pageSize=50&startingIndex=0&browseQuery=true)
- [Kaggle — Maize Seed Dataset](https://www.kaggle.com/datasets/yungprof123/maize-seed-dataset)

Each image is labeled with its defect class (or `good_maize`), and the model learns to classify a
224×224 cropped kernel image into one of those five classes.

## Data Pipeline

1. **Capture** — the mobile app captures exactly 3 images of a produce sample on a dark,
   high-contrast mat (camera-only, no gallery import — see [Frontend Mobile → Security
   Measures](/frontend-mobile)).
2. **Transmit** — images are sent as a multipart HTTP POST to the AI service's FastAPI gateway.
3. **Segment** — OpenCV isolates each individual kernel via grayscale conversion, Gaussian blur,
   Otsu thresholding, and contour detection (see [Computer Vision Pipeline](#2-computer-vision-pipeline-two-step-automated-segmentation)
   below).
4. **Classify** — each cropped kernel is resized to 224×224 and run through the YOLOv8-cls model.
5. **Aggregate** — `evaluate_maize_batch` tallies per-class percentages and applies the
   weakest-link grading logic to produce a single batch grade.
6. **Price** — `get_dynamic_valuation` maps the grade to a price modifier against the live WFP HDX
   market price.
7. **Persist** — the grade, defect ratios, and confidence score are written to the
   `ai_grading_result` table and surfaced in the Quality Assessment Report (see
   [Database → AI Grading Result Table](/database)).

## Integration

- **Input:** exactly 3 images per grading session, submitted as multipart form data alongside
  `crop_type` and `quantity` metadata via `POST /produce_listings/`.
- **Authorization:** the AI service sits behind the same API Security Layer as the rest of the
  backend (see [Architecture](/architecture)) — requests are authenticated with the cooperative
  manager's JWT before an image is ever processed.
- **Anonymization:** grading images are associated only with the produce listing and owning
  cooperative — no buyer data, payment data, or cross-cooperative data is ever included in the
  payload sent to the classification model.

## Evaluation Method

- The model is evaluated against a held-out, labeled validation split of the training dataset,
  scored per defect class (precision/recall) rather than only on overall accuracy — since a
  false-negative on `insect_damage` is more costly than a false-negative on cosmetic discoloration.
- Batch-level grading accuracy is additionally validated by comparing the AI-assigned grade against
  expert/manual grading on the same physical sample, per the [Quality Assurance → Test Data
  Management](/quality-assurance) real-data process.

## Accuracy Results

- **Target:** minimum **95% precision** classifying thresholds for Grade A through Grade D — see
  [Quality Assurance → Release Criteria](/quality-assurance).
- **Inference latency target:** grading reports return within **< 3 seconds** under concurrent
  image upload spikes.

## Known Limitations

- **Lighting and background sensitivity** — the segmentation step assumes a dark, high-contrast mat
  and reasonably even lighting; unusual backgrounds or glare can degrade contour detection before
  classification even runs.
- **Single-crop-type training** — the current model is trained specifically on maize kernels and
  does not generalize to other crops.
- **Sample representativeness assumption** — grading assumes the photographed sample statistically
  represents the full batch (see [Overview → Assumptions](/overview)); an unrepresentative sample
  can produce a grade that doesn't hold for the whole batch.
- **No adversarial-image defense** — the pipeline does not currently detect deliberately staged or
  manipulated photos beyond disabling gallery import client-side.
- **No in-session retake guidance** — if segmentation yields zero usable kernel crops, the pipeline
  returns an `"Unknown"` grade rather than prompting the user to retake a specific photo.

## Future Improvements

- **Multi-crop support** — extending the classifier (or adding sibling models) to grade other
  staple crops beyond maize.
- **Active learning loop** — feeding disputed/overridden grades (via Admin dispute resolution, see
  [Security → Incident Response](/security)) back into the training set to continuously improve
  accuracy.
- **On-device pre-check** — a lightweight on-device model to flag obviously unusable photos
  (blur, poor lighting) before upload, reducing round-trips for cooperative managers.
- **Explainability overlays** — visually highlighting which kernels were flagged for which defect
  class on the Quality Assessment Report, rather than only showing aggregate percentages.

## 2. Computer Vision Pipeline (Two-Step Automated Segmentation)

Rather than heavy sliding-window or tiled-slicing object detection, the backend implements a
resource-efficient two-stage extraction + batch-classification layout:

- **Step 1** — localized contour edge-detection via OpenCV finds and crops individual kernels.
- **Step 2** — cropped kernels are fed directly into a specialized YOLOv8 image classification
  network matching native training sizes.

```python
import cv2
import numpy as np
import os
from ultralytics import YOLO

MODEL = YOLO("best_maize_yolov8_cls.pt")

def pipeline_process_image(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(
        blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    cropped_seeds = []
    for contour in contours:
        if cv2.contourArea(contour) < 150:
            continue
        x, y, w, h = cv2.boundingRect(contour)
        crop = img[max(0, y - 5):y + h + 5, max(0, x - 5):x + w + 5]
        resized_crop = cv2.resize(crop, (224, 224))
        cropped_seeds.append(resized_crop)

    if not cropped_seeds:
        return {"grade": "Unknown", "ratios": {}}

    results = MODEL.predict(source=cropped_seeds, conf=0.50, verbose=False)
    predictions = [MODEL.names[r.probs.top1] for r in results]
    return evaluate_maize_batch(predictions)
```

**Training data sources:**

- [RoboFlow — Maize Seeds Quality Analysis](https://universe.roboflow.com/maize-seeds-analysis/maize-seeds-quality-analysis/browse?queryText=AVERAGE&pageSize=50&startingIndex=0&browseQuery=true)
- [Kaggle — Maize Seed Dataset](https://www.kaggle.com/datasets/yungprof123/maize-seed-dataset)

## 3. Quality Grading Framework & Macro Valuation

Once classification arrays are computed against the total isolated kernel sample size, a strict
**weakest-link evaluation** applies: if any single defect parameter crosses a threshold tier
boundary, the entire batch drops to that lower performance bracket.

| Quality Parameter (Defect Class) | Grade A (Premium) | Grade B (Standard) | Grade C (Commercial) | Grade D (Poor) | Reject Grade (Animal Feed) |
| -------------------------------- | ----------------- | ------------------ | -------------------- | -------------- | -------------------------- |
| Class 1: Insect / Pest Damage    | < 3.0%            | < 6.0%             | < 9.0%               | < 15.0%        | ≥ 15.0%                    |
| Class 2: Discolored / Moldy      | < 3.0%            | < 6.0%             | < 9.0%               | < 15.0%        | ≥ 15.0%                    |
| Class 3: Broken / Chipped Grains | < 6.0%            | < 7.0%             | < 8.0%               | < 9.0%         | ≥ 9.0%                     |
| Class 4: Extraneous Matters      | < 1.0%            | < 1.5%             | < 2.0%               | < 2.5%         | ≥ 2.5%                     |

```python
def evaluate_maize_batch(predictions_list):
    total = len(predictions_list)
    counts = {
        c: predictions_list.count(c)
        for c in ['good_maize', 'insect_damage', 'moldy', 'broken', 'extraneous_matter']
    }

    p_insect = (counts['insect_damage'] / total) * 100
    p_moldy = (counts['moldy'] / total) * 100
    p_broken = (counts['broken'] / total) * 100
    p_extraneous = (counts['extraneous_matter'] / total) * 100

    # Parametric Tier Logic Assignment
    g_ins = 4 if p_insect < 3 else 3 if p_insect < 6 else 2 if p_insect < 9 else 1 if p_insect < 15 else 0
    g_mld = 4 if p_moldy < 3 else 3 if p_moldy < 6 else 2 if p_moldy < 9 else 1 if p_moldy < 15 else 0
    g_brk = 4 if p_broken < 6 else 3 if p_broken < 7 else 2 if p_broken < 8 else 1 if p_broken < 9 else 0
    g_ext = 4 if p_extraneous < 1 else 3 if p_extraneous < 1.5 else 2 if p_extraneous < 2 else 1 if p_extraneous < 2.5 else 0

    lowest_score = min(g_ins, g_mld, g_brk, g_ext)
    grades = {4: "Grade A", 3: "Grade B", 2: "Grade C", 1: "Grade D", 0: "Reject Grade"}
    final_grade = grades[lowest_score]

    return {
        "grade": final_grade,
        "ratios": {
            "insect": p_insect,
            "moldy": p_moldy,
            "broken": p_broken,
            "extraneous": p_extraneous,
        },
    }


def get_dynamic_valuation(grade, base_market_price):
    modifiers = {
        "Grade A": 1.10,
        "Grade B": 1.00,
        "Grade C": 0.90,
        "Grade D": 0.75,
        "Reject Grade": 0.50,
    }
    return round(base_market_price * modifiers.get(grade, 1.00), 2)
```

## 4. Production Deployment Blueprint

The containerized pipeline runs inside stateless Linux containers on **Google Cloud Platform
Cloud Run**, backed by automated **GitHub Actions** for microservice rollouts.

- **Memory allocation:** minimum 2Gi per container instance, to eliminate PyTorch runtime memory
  allocation overhead.
- **Graphics extension interfacing:** base slim Linux runtimes lack target dynamic shared objects;
  `libgl1-mesa-glx` and `libglib2.0-0` are injected during multi-stage builds.

```dockerfile
FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```
