# AI Quality Assessment Module — Technical Brief

**Two-Step Segmentation & Classification Production Pipeline**

## 1. System Overview & Architecture

The Quality Assessment Module is a containerized, backend-driven AI system engineered to inspect,
grade, and evaluate multi-seed maize crop samples. To resolve critical downscaling errors that
occur when passing wide-angle, high-resolution photos containing many seeds to a network trained
on single crops, the system implements a **Two-Step Edge Processing Pipeline**. Architectural
boundaries decouple consumer interface layers from heavy hardware dependencies, keeping core
compute isolated inside serverless microservices.

| Architectural Layer | Core Responsibilities & Components | Key Dependencies |
|---|---|---|
| Frontend (Client Web/Mobile) | Captures multi-seed crop samples on a high-contrast dark surface; dispatches binary payloads via stateless HTTP POST; renders objective grades, defect percentages, and financial valuations | React / Flutter / Native JS, Axios / Fetch API |
| Backend AI Engine (Serverless Container) | Receives images via a FastAPI gateway and executes OpenCV contour segmentation; processes extracted seed crops through an Ultralytics YOLOv8 classifier; computes defect matrices, determines batch grades, maps pricing metrics | Python 3.10 / FastAPI, OpenCV-Python, Ultralytics YOLOv8-cls |

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
|---|---|---|---|---|---|
| Class 1: Insect / Pest Damage | < 3.0% | < 6.0% | < 9.0% | < 15.0% | ≥ 15.0% |
| Class 2: Discolored / Moldy | < 3.0% | < 6.0% | < 9.0% | < 15.0% | ≥ 15.0% |
| Class 3: Broken / Chipped Grains | < 6.0% | < 7.0% | < 8.0% | < 9.0% | ≥ 9.0% |
| Class 4: Extraneous Matters | < 1.0% | < 1.5% | < 2.0% | < 2.5% | ≥ 2.5% |

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
