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
      - ~/workspace/docs/resume:/app/uploads

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

## 🚀 Future Enhancements

- [ ] JWT Authentication & Authorization
- [ ] Role-based access control
- [ ] AWS S3 integration (cloud storage)
- [ ] Resume search & filtering
- [ ] Pagination
- [ ] Drag & drop upload
- [ ] AI-based resume parsing

---

## 📦 Dockerfiles

### Backend (`backend/resume/Dockerfile`)
```dockerfile
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend (`frontend/resume-frontend/Dockerfile`)
```dockerfile
FROM nginx:alpine
COPY dist/resume-frontend/browser /usr/share/nginx/html
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html
EXPOSE 80
```
