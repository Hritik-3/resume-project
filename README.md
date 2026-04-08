# 📄 Resume Management System

A full-stack application to upload, store, preview, download, and delete resumes — built with **Spring Boot**, **Angular 18**, and **MongoDB**, fully containerized with **Docker Compose**.

---

## 🧱 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | Angular 18 (Nginx)      |
| Backend    | Spring Boot (Java 17)   |
| Database   | MongoDB                 |
| Storage    | Local File System       |
| Container  | Docker & Docker Compose |

---

## 🏗️ Architecture

```
Browser
  └── Frontend (Angular → Nginx)
        └── REST API (Spring Boot)
              ├── MongoDB (Metadata)
              └── Local File System (Resume Files)
```

---

## ✅ Features

### Backend
- Upload resumes (PDF / DOC / DOCX)
- Store files locally with UUID-based naming
- Store metadata in MongoDB
- Download resume by ID
- Delete resume (file + DB record)
- REST API with proper validation

### Frontend
- File upload UI with type & size validation
- Toast notifications (auto-hide)
- Loading spinner during upload
- Resume listing table with file type badges
- PDF preview in browser
- Download & delete with confirmation
- Responsive Bootstrap layout
- Empty state UI

---

## 📁 Project Structure

```
project-root/
├── backend/
│   └── resume/              # Spring Boot application
├── frontend/
│   └── resume-frontend/     # Angular application
└── docker-compose.yml
```

### Frontend (Angular)
```
src/app/
├── core/services/           # API calls
├── features/resume/
│   ├── upload/              # Upload UI
│   └── list/                # Resume list UI
└── shared/models/           # Data models
```

---

## 🗄️ MongoDB Schema

**Database:** `biz`  
**Collection:** `resumes`

```json
{
  "_id": "123",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "filePath": "/path/to/file",
  "fileSize": 70965,
  "uploadedAt": "2026-03-25T02:12:58"
}
```

---

## 🌐 API Reference

| Method   | Endpoint                          | Description          |
|----------|-----------------------------------|----------------------|
| `POST`   | `/api/resumes/upload`             | Upload a resume      |
| `GET`    | `/api/resumes`                    | Get all resumes      |
| `GET`    | `/api/resumes/download/{id}`      | Download a resume    |
| `DELETE` | `/api/resumes/{id}`               | Delete a resume      |

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Run the entire application with one command:

```bash
docker-compose up --build
```

### Stop the application:

```bash
docker-compose down
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:

  mongo:
    image: mongo
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend/resume
    container_name: backend
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    environment:
      - SPRING_PROFILES_ACTIVE=docker
    volumes:
      - ./uploads:/app/uploads   # ✅ Relative path — works across all machines

  frontend:
    build: ./frontend/resume-frontend
    container_name: frontend
    ports:
      - "4200:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

### Access the app:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080

---

## 🛠️ Manual Setup (Without Docker)

### Backend

**Prerequisites:** Java 17, Maven, MongoDB running locally

1. Configure `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/biz
   file.upload.dir=~/workspace/docs/resume/
   ```

2. Build and run:
   ```bash
   ./mvnw clean package
   java -jar target/resume-0.0.1-SNAPSHOT.jar
   ```
   Or simply:
   ```bash
   mvn spring-boot:run
   ```

---

### Frontend

**Prerequisites:** Node.js, Angular CLI

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run dev server:
   ```bash
   ng serve -o
   ```
   App opens at: http://localhost:4200

---

## 🐳 Individual Docker Commands

### Backend
```bash
# Build JAR
./mvnw clean package

# Build image
docker build -t resume-backend .

# Run container
docker run -p 8080:8080 resume-backend
```

### Frontend
```bash
# Build Angular app
npm run build

# Build image
docker build -t resume-frontend .

# Run container
docker run -p 4200:80 resume-frontend
```

### MongoDB
```bash
docker run -d -p 27017:27017 --name mongo mongo
```

> ⚠️ **Docker Networking Note:**  
> Inside Docker containers, backend connects to MongoDB using `mongo:27017`.  
> Outside Docker (local dev), use `localhost:27017`.

---

## 📦 Dockerfiles

### Backend (`backend/resume/Dockerfile`)

Uses a **multi-stage build** — Stage 1 compiles the JAR using Maven, Stage 2 runs it on a lightweight JDK image. This avoids shipping Maven and source code in the final image.

```dockerfile
# Stage 1: Build the JAR
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend (`frontend/resume-frontend/Dockerfile`)

Uses a **multi-stage build** — Stage 1 builds the Angular app using Node.js, Stage 2 serves the compiled output with Nginx. Also includes a fix for Angular routing via a custom `nginx.conf`.

```dockerfile
# Stage 1: Build Angular
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
# Copy built files from previous stage
COPY --from=build /app/dist/resume-frontend/browser /usr/share/nginx/html
# Fix Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Optional: rename index file if it exists
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
    mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi
EXPOSE 80
```

---

## 🔄 Data Flow

### Upload
```
User selects file → Frontend validates → API call → Backend validates
→ File saved to filesystem → Metadata saved to MongoDB → Response returned
```

### Download / Preview
```
User clicks → Request to backend → Metadata fetched → File read from disk
→ Returned as Blob → Opened in browser (preview) or downloaded
```

### Delete
```
User clicks delete → Confirmation shown → API call
→ File deleted from filesystem → Record removed from MongoDB → UI refreshed
```

---

## 🐞 Troubleshooting

### Docker Build Failure — Maven Dependency Download Error

**Symptom:**
- Build fails during Maven dependency download
- Docker build stops unexpectedly mid-way
- Error repeats on retry without any code changes

**Cause:**

This is **not a code issue** — it is an **environment and Docker cache issue**.

On first-time builds (especially on a new machine), Docker downloads all Maven dependencies. If the build is interrupted — due to network instability, a system sleep, or a corrupted cache layer — Docker may reuse the broken cached layer on subsequent builds, causing the error to repeat indefinitely.

**Resolution:**

**Step 1 — Clear the Docker build cache:**
```bash
docker builder prune -a
```

**Step 2 — Rebuild from scratch:**
```bash
docker compose up -d --build
```

**Why this works:**

| State       | Behaviour                                                    |
|-------------|--------------------------------------------------------------|
| Before fix  | Docker reuses corrupted cached layers; build fails repeatedly |
| After fix   | Cache is fully cleared; fresh dependency download succeeds   |

> ⚠️ This issue has been observed on machines where Docker Desktop was installed fresh or where a previous build was interrupted. Running `docker builder prune -a` resolves it completely.


