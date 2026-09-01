# Glossary

This glossary defines the key technical, business, and platform-specific terms used throughout the Ishuko documentation.

| Term                     | Definition                                                                                                                                        | Category        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Admin**                | A user with elevated privileges who can manage and monitor the Ishuko platform.                                                                   | User Management |
| **Admin Dashboard**      | The web interface used by authorized administrators to manage and monitor the Ishuko platform.                                                    | Platform        |
| **AI**                   | Artificial Intelligence; technology that enables software to perform tasks that normally require human intelligence.                              | Technology      |
| **AI Grading**           | The process of using artificial intelligence to assess and classify agricultural produce.                                                         | AI              |
| **AI Grading Result**    | The output generated after the AI has assessed agricultural produce.                                                                              | AI              |
| **API**                  | Application Programming Interface; a set of rules and endpoints that allows different software components to communicate.                         | Backend         |
| **API Client**           | A component responsible for sending requests to and receiving responses from the backend API.                                                     | Backend         |
| **API Endpoint**         | A specific URL through which a client can interact with a particular backend function or resource.                                                | Backend         |
| **Authentication**       | The process of verifying the identity of a user or system.                                                                                        | Security        |
| **Authorization**        | The process of determining what an authenticated user is permitted to access or perform.                                                          | Security        |
| **Audit Log**            | A record of important actions and events performed within the system for accountability, security, and troubleshooting.                           | Security        |
| **Backend**              | The server-side component responsible for business logic, database operations, APIs, authentication, and integrations.                            | Architecture    |
| **Base URL**             | The root URL used when communicating with the backend API.                                                                                        | Backend         |
| **Business Logic**       | The rules and processes that determine how the Ishuko platform operates.                                                                          | Backend         |
| **Client**               | An application that communicates with the backend API, such as a mobile application or admin dashboard.                                           | Architecture    |
| **CRUD**                 | Create, Read, Update, Delete; the four fundamental operations performed on application data.                                                      | Database        |
| **Database**             | A structured system used to store, organize, and retrieve application data.                                                                       | Database        |
| **Database Model**       | A software representation of a database entity and its fields.                                                                                    | Database        |
| **Database Migration**   | A controlled change to the structure of the database, such as adding tables or columns.                                                           | Database        |
| **Dependency**           | A library, package, service, or component required by another part of the application.                                                            | Development     |
| **Dependency Injection** | A design pattern in which dependencies are provided to a component instead of being created directly within it.                                   | Development     |
| **Edge AI**              | Artificial intelligence processing performed locally or near the device where data is collected rather than relying entirely on cloud processing. | AI              |
| **Environment Variable** | A configuration value stored outside application source code, often used for URLs, credentials, and secret keys.                                  | Configuration   |
| **`.env`**               | A configuration file commonly used during development to store environment variables.                                                             | Configuration   |
| **Firebase**             | A Google platform providing services such as authentication, notifications, analytics, and other application services.                            | Integration     |
| **Foreign Key**          | A database field that establishes a relationship between records in different database tables.                                                    | Database        |
| **FastAPI**              | A Python web framework used to build the Ishuko backend API.                                                                                      | Technology      |
| **Grading**              | The process of assessing agricultural produce according to predefined quality criteria.                                                           | Business        |
| **HTTP**                 | Hypertext Transfer Protocol; a communication protocol used for transferring data between clients and servers.                                     | Web             |
| **HTTPS**                | Hypertext Transfer Protocol Secure; the encrypted version of HTTP.                                                                                | Security        |
| **HTTP Status Code**     | A numerical response returned by a server indicating the result of an HTTP request.                                                               | Backend         |
| **ID**                   | Identifier; a unique value used to identify a specific record or resource.                                                                        | Database        |
| **Integration**          | A connection between Ishuko and an external service or system.                                                                                    | Architecture    |
| **Index**                | A database structure used to improve the speed of data retrieval.                                                                                 | Database        |
| **Ishuko**               | The agricultural technology platform being developed to support users and agricultural processes within the target market.                        | Platform        |
| **JSON**                 | JavaScript Object Notation; a lightweight data format commonly used for API communication.                                                        | Backend         |
| **JWT**                  | JSON Web Token; a token format commonly used to securely transmit authentication information.                                                     | Security        |
| **Logging**              | The process of recording application events, errors, warnings, and system activities.                                                             | Monitoring      |
| **Middleware**           | Software that runs between an incoming request and the application's main request handler.                                                        | Backend         |
| **Model**                | A representation of an application or database entity.                                                                                            | Backend         |
| **Mobile Application**   | The user-facing application through which users interact with Ishuko services.                                                                    | Platform        |
| **Notification**         | A message generated by the system to inform a user about an event or action.                                                                      | Platform        |
| **Notification Service** | A backend component responsible for creating, managing, and delivering notifications.                                                             | Backend         |
| **ORM**                  | Object-Relational Mapping; a technique that allows developers to interact with relational databases using programming objects.                    | Database        |
| **Payment**              | A financial transaction processed through the Ishuko platform.                                                                                    | Payments        |
| **Payment Gateway**      | A service that facilitates electronic payment processing.                                                                                         | Payments        |
| **Payment Status**       | The current state of a payment, such as pending, successful, failed, cancelled, or refunded.                                                      | Payments        |
| **Permission**           | A rule determining whether a user is allowed to perform an action or access a resource.                                                           | Security        |
| **Primary Key**          | A database field that uniquely identifies each record in a table.                                                                                 | Database        |
| **Pydantic**             | A Python library used for data validation and serialization, particularly with FastAPI.                                                           | Technology      |
| **Python**               | The programming language used to develop the Ishuko backend.                                                                                      | Technology      |
| **Query**                | A request used to retrieve or manipulate data in a database.                                                                                      | Database        |
| **Query Parameter**      | An optional value included in an API URL to provide filtering, searching, sorting, or pagination information.                                     | API             |
| **RBAC**                 | Role-Based Access Control; a security model where permissions are assigned according to user roles.                                               | Security        |
| **Repository**           | A backend layer responsible for interacting with the database.                                                                                    | Architecture    |
| **Request**              | A message sent by a client to the backend asking the server to perform an operation or return information.                                        | API             |
| **Response**             | The message returned by the backend after processing a request.                                                                                   | API             |
| **REST API**             | Representational State Transfer API; an API architecture that uses HTTP methods and resources for communication.                                  | API             |
| **Role**                 | A classification assigned to a user that determines their permissions and level of access.                                                        | User Management |
| **Router**               | A backend component that defines API endpoints and directs requests to the appropriate application logic.                                         | Backend         |
| **Schema**               | A definition of the structure, fields, data types, and validation rules expected for application data.                                            | Backend         |
| **Security**             | The mechanisms and practices used to protect the Ishuko platform, users, and data from unauthorized access or misuse.                             | Security        |
| **Service**              | A backend layer responsible for implementing business logic and coordinating application operations.                                              | Architecture    |
| **Session**              | A period during which a user interacts with the application while authenticated.                                                                  | Authentication  |
| **SQL**                  | Structured Query Language; a language used to interact with relational databases.                                                                 | Database        |
| **Status**               | A value representing the current state of a resource or process.                                                                                  | General         |
| **Soft Delete**          | A deletion approach where a record remains in the database but is marked as deleted or inactive.                                                  | Database        |
| **Token**                | A digital value used to represent authentication or authorization information.                                                                    | Security        |
| **Transaction**          | A recorded business or financial operation performed through the Ishuko platform.                                                                 | Business        |
| **Third-Party Service**  | An external service integrated with Ishuko to provide additional functionality.                                                                   | Integration     |
| **UI**                   | User Interface; the visual elements through which users interact with the application.                                                            | Design          |
| **User**                 | An individual who interacts with the Ishuko platform.                                                                                             | User Management |
| **User ID**              | A unique identifier assigned to a user account.                                                                                                   | User Management |
| **User Role**            | A role assigned to a user that determines their access and permissions.                                                                           | User Management |
| **Validation**           | The process of checking whether data meets predefined requirements and rules.                                                                     | Backend         |
| **Version Control**      | A system used to track and manage changes to source code and project files.                                                                       | Development     |
| **Webhook**              | An HTTP callback used by an external service to notify Ishuko when a specific event occurs.                                                       | Integration     |
| **Web Application**      | An application accessed through a web browser. The Ishuko Admin Dashboard is an example.                                                          | Platform        |

## Technical Abbreviations

| Abbreviation | Full Meaning                       | Description                                                                |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------- |
| **AI**       | Artificial Intelligence            | Technology used to perform tasks that normally require human intelligence. |
| **API**      | Application Programming Interface  | Interface that enables communication between software components.          |
| **CRUD**     | Create, Read, Update, Delete       | Fundamental operations for managing data.                                  |
| **DB**       | Database                           | System used to store and manage application data.                          |
| **DTO**      | Data Transfer Object               | Object used to transfer data between different parts of an application.    |
| **HTTP**     | Hypertext Transfer Protocol        | Protocol used for communication between clients and servers.               |
| **HTTPS**    | Hypertext Transfer Protocol Secure | Secure and encrypted version of HTTP.                                      |
| **ID**       | Identifier                         | A unique value used to identify a resource.                                |
| **JSON**     | JavaScript Object Notation         | Data format commonly used for API communication.                           |
| **JWT**      | JSON Web Token                     | Token format commonly used for authentication.                             |
| **ORM**      | Object-Relational Mapping          | Technique for interacting with databases using programming objects.        |
| **RBAC**     | Role-Based Access Control          | Security model based on user roles and permissions.                        |
| **REST**     | Representational State Transfer    | Architectural style commonly used for web APIs.                            |
| **SQL**      | Structured Query Language          | Language used to interact with relational databases.                       |
| **UI**       | User Interface                     | Visual interface through which users interact with the application.        |
| **URL**      | Uniform Resource Locator           | Address used to locate a resource on a network.                            |
| **UUID**     | Universally Unique Identifier      | Identifier designed to be unique across systems.                           |

## Common HTTP Status Codes

| Status Code | Meaning               | Description                                                                             |
| ----------- | --------------------- | --------------------------------------------------------------------------------------- |
| **200**     | OK                    | The request was successfully processed.                                                 |
| **201**     | Created               | A new resource was successfully created.                                                |
| **400**     | Bad Request           | The request contains invalid or malformed information.                                  |
| **401**     | Unauthorized          | Authentication is required or has failed.                                               |
| **403**     | Forbidden             | The user is authenticated but does not have permission to perform the requested action. |
| **404**     | Not Found             | The requested resource could not be found.                                              |
| **409**     | Conflict              | The request conflicts with the current state of the resource.                           |
| **422**     | Unprocessable Entity  | The request contains validation errors.                                                 |
| **500**     | Internal Server Error | An unexpected error occurred on the server.                                             |

## Ishuko-Specific Terms

| Term                       | Definition                                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ishuko Platform**        | The complete ecosystem consisting of the user-facing applications, backend services, database, AI functionality, payment services, notifications, and administrative tools. |
| **Ishuko Admin Dashboard** | The administrative web application used to manage and monitor platform activities.                                                                                          |
| **AI Grading System**      | The component responsible for processing produce assessment and generating grading results.                                                                                 |
| **Produce Grading**        | The process of evaluating and classifying agricultural produce according to defined quality standards.                                                                      |
| **AI Grading Result**      | The recorded output of the AI grading process.                                                                                                                              |
| **Payment Record**         | A database record containing information about a payment transaction.                                                                                                       |
| **Audit Log**              | A historical record of significant actions performed within the platform.                                                                                                   |
| **Notification**           | A system-generated message informing a user about an event or change.                                                                                                       |
| **Edge-Based AI**          | AI processing performed locally or close to the point where produce is assessed, reducing reliance on remote image storage and processing.                                  |
| **Role**                   | A predefined set of permissions assigned to a user.                                                                                                                         |
| **Permission**             | An individual access rule determining what an authorized user can do within the platform.                                                                                   |

## Product & Business Terms

This table covers everything related to marketplace mechanics, grading rules, user personas, and financial flows.

| Term Name                              | Definition                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cooperative (Coop)**                 | A group of smallholder maize farmers represented on Ishuko by a Cooperative Manager. They register a depot location, upload produce for grading, and receive payments. |
| **Cooperative Manager / Leader**       | The primary seller-side user who registers the coop, logs harvests, runs camera grading sessions, and collects escrowed payments.                                      |
| **Wholesale Buyer**                    | A corporate or retail entity that browses the marketplace, buys graded produce in bulk, deposits escrow funds, and collects the batch.                                 |
| **Platform Administrator**             | Monitors system activity and manages users via the admin dashboard; has exclusive access to admin-only API routes.                                                     |
| **Marketplace**                        | The in-app storefront where buyers can browse and purchase graded, AI-verified produce listings.                                                                       |
| **Quality Assessment Report**          | The output shown to cooperatives combining the assigned grade, defect percentages, confidence score, and calculated price.                                             |
| **Grade A / B / C / D / Reject**       | The five quality tiers assigned to a batch, ranging from Excellent (A) down to Poor (D) or Reject (unfit for use).                                                     |
| **Defect Class**                       | The four quality dimensions measured for grading: Insect/Pest Damage, Discolored/Moldy grain, Broken/Chipped Grains, and Extraneous Matter.                            |
| **Weakest-Link Evaluation**            | A grading rule where a batch's final grade is capped at its worst-performing defect class, regardless of how well other classes scored.                                |
| **Confidence Score**                   | A percentage on the Quality Assessment Report showing how certain the AI model is about its assigned grade.                                                            |
| **Pricing Engine / Dynamic Valuation** | Logic converting a grade into a price using live market data (WFP HDX) multiplied by a grade-based modifier.                                                           |
| **Platform Fee**                       | A 2% transaction fee deducted by Ishuko from the total sale amount before the cooperative is paid.                                                                     |
| **Escrow / Escrow Account**            | A temporary holding account that safely secures a buyer's payment until pickup is confirmed.                                                                           |
| **OTP / 6-Digit Code / Token**         | A single-use verification code given to the buyer after deposit; handed to the manager at pickup to release escrow. Expires in 7 days.                                 |
| **Cancellation Penalty**               | A 5% deduction applied if a buyer fails to collect an order before the OTP expires; compensates the coop for the hold.                                                 |
| **Settlement / Handover**              | The final transaction step where the buyer collects produce, provides the OTP, and instantly releases escrowed funds to the coop.                                      |
| **Pickup Date**                        | The buyer-selected collection date, restricted to within 7 days of placing the order.                                                                                  |
| **Listing Status**                     | The lifecycle stages of a listing: PENDING_GRADE → MARKETPLACE (or REJECTED) → RESERVED → COMPLETED.                                                                   |
| **Order Status**                       | The lifecycle stages of a buyer's order: AWAITING_DEPOSIT → ESCROWED → COLLECTED (or EXPIRED).                                                                         |
| **Escrow Status**                      | The lifecycle stages of a payment: HELD → DISBURSED (or REFUNDED).                                                                                                     |
| **Persona**                            | Fictional, research-informed user profiles (like Mark the manager or Amina the buyer) used to guide design choices around real needs.                                  |
| **Jobs To Be Done (JTBD)**             | A framework detailing the core tasks users "hire" Ishuko to do (e.g., Quality Assessment, Pricing, Payment, Pickup).                                                   |
| **Stakeholder Categories**             | PRD mapping: Players (active users), Context Setters (payment providers), Subjects (farmers), and Crowd (broader supporters).                                          |

---

## AI & Computer Vision Terms

This table isolates the concepts and tools powering the image processing and grain assessment features.

| Term Name                               | Definition                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Computer Vision Quality Grading**     | The automated system feature using AI image analysis instead of manual inspection to assign objective produce grades.               |
| **YOLOv8 (Ultralytics YOLOv8-cls)**     | The image classification neural network used to categorize each cropped maize kernel into a specific defect or good category.       |
| **OpenCV**                              | The computer vision library handling image preprocessing, including contour detection and cropping individual kernels.              |
| **Two-Step Edge Processing Pipeline**   | Grading architecture: Step 1 uses OpenCV to segment a photo into kernel crops; Step 2 feeds crops into YOLOv8 to preserve accuracy. |
| **Contour Segmentation**                | An OpenCV technique (thresholding + findContours) used to isolate each kernel's boundary for individual classification.             |
| **Training Datasets (RoboFlow/Kaggle**) | The external maize-image datasets used to train the YOLOv8 classification model.                                                    |

---

## Backend, Infrastructure & Tooling Terms

This table outlines the technical stack, database patterns, security configurations, and deployment tools.

| Term Name                             | Definition                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FastAPI**                           | The Python web framework powering Ishuko's core backend API and the AI grading microservice.                                                           |
| **Layered Architecture**              | Code organization pattern: Models (DB entities) → Repositories (data access) → Services (business logic) → Schemas (validation) → Routers (endpoints). |
| **SQLAlchemy**                        | The Python ORM used to map backend models directly to PostgreSQL database tables.                                                                      |
| **Alembic**                           | The lightweight migration tool used to version and apply schema changes to the database (alembic upgrade head).                                        |
| **PostgreSQL**                        | Ishuko's primary relational database, hosted via the Heroku Postgres add-on.                                                                           |
| **JWT (JSON Web Token)**              | A signed token issued at login via python-jose for secure API request authentication; expires after JWT_EXPIRE_DAYS.                                   |
| **bcrypt / Passlib**                  | The secure hashing algorithm and library used to encrypt passwords so plain text is never stored in the database.                                      |
| **CORS**                              | Browser security mechanism that strictly limits which frontend origins can call the backend API via an explicit allow-list.                            |
| **Multipart Form Data**               | The HTTP payload format used by POST /produce_listings/ to send both data fields and binary image files together.                                      |
| **Webhook (Flutterwave)**             | An inbound HTTP callback from Flutterwave confirming a payment event to update the internal payment table status.                                      |
| **Mobile Money (Airtel/Zamtel/MTN)**  | Telecom-linked payment rails used in Zambia; a user's mobile phone_number is directly tied to this account.                                            |
| **Heroku**                            | The hosting platform for the FastAPI backend and PostgreSQL database, deployed via git push heroku main.                                               |
| **Vercel**                            | The hosting platform for the Next.js admin web dashboard, featuring auto-deploys and PR preview builds.                                                |
| **GCP Cloud Run**                     | Hosts the containerized AI grading microservice as a stateless Linux container via GitHub Actions.                                                     |
| **WFP HDX**                           | The external World Food Programme dataset providing live Zambia maize market prices to fuel the dynamic pricing engine.                                |
| **Config Vars / Env Variables**       | Deployment secrets (DATABASE_URL, JWT_SECRET_KEY, etc.) kept safe from source control and configured per-platform.                                     |
| **CI (Continuous Integration)**       | Automated GitHub pipelines running linting and unit tests (flutter analyze, Jest, etc.) on every Pull Request.                                         |
| **UAT (User Acceptance Testing)**     | Final testing phase verifying system alignment with user needs, featuring regression testing to protect existing report logic.                         |
| **ERD (Entity Relationship Diagram)** | A diagram illustrating the relationships between the 6 core tables: user, cooperative, produce_listing, ai_grading_result, payment, and order.         |

## Related Documentation

For detailed information about the concepts in this glossary, refer to the relevant sections of the Ishuko documentation:

- Architecture Documentation
- Backend Documentation
- API Documentation
- Database Documentation
- Authentication & Authorization Documentation
- AI Grading Documentation
- Payment Documentation
- Notification Documentation
- Admin Dashboard Documentation
- Security Documentation
- Deployment Documentation

---

## Maintenance

This glossary should be updated whenever a new technical term, platform feature, service, abbreviation, or domain-specific concept is introduced into the Ishuko system.
