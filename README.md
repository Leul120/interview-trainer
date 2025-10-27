# Interview Trainer

Comprehensive interview training platform composed of microservices (Java Spring Boot), a Flask API utility, and a Next.js frontend. This repository contains the server-side services and the frontend application used to prepare, schedule, and run mock interviews with AI-assisted analysis, scoring, and feedback.

---

## Project Structure

- `flask-api/` — small Flask utility API used for lightweight integrations or testing.
  - `app.py` - main Flask application.
  - `dockerfile` - container definition for local testing.
  - `requirements.txt` - Python dependencies.

- `interview-trainer/` — backend monorepo containing multiple Spring Boot microservices.
  - `apiGateway/` - Gateway routing, security configuration, and global filters.
  - `authService/` - User authentication, sign-up, JWT handling, and user entities.
  - `feedbackAndScoringService/` - Stores and computes interview feedback and scores.
  - `interviewSessionService/` - Real-time session orchestration and websocket handling.
  - `notificationService/` - Email/SMS/push notifications for scheduled interviews.
  - `processingService/` - Video/audio processing, emotion detection, and analysis integrations.
  - `questionGenerationService/` - Generates interview questions and difficulty levels.
  - `service-registry/` - Service discovery (Eureka/Consul depending on config).
  - `storageService/` - Stores interview recordings and assets.
  - `userService/` - User profile management and related entities.

- `interview-trainer-frontend/` — Next.js + TypeScript frontend application.
  - `app/` - Next.js app routes and pages.
  - `components/` - React components used across the app.
  - `services/` - Client-side API adapters and websockets.
  - `public/` - Static assets.
  - `package.json` / `next.config.mjs` - Frontend build configuration.

---

## Purpose

This repository aims to provide a full-stack interview practice platform that supports:

- Live, real-time mock interviews (websockets + video/audio streaming).
- AI-assisted analysis of candidate responses, including emotion detection and scoring.
- Question generation and difficulty management.
- Scheduling, notifications, and recording storage.
- A fast, modern frontend (Next.js) for candidates/interviewers to run sessions.

The microservice architecture isolates concerns so services can be scaled independently and developed/tested in parallel.

---

## Quick start (developer)

Prerequisites (one-liners):

- Java 17+ (or the version defined in each microservice pom.xml)
- Maven 3.6+
- Node.js 18+ and pnpm/npm (for the frontend)
- Python 3.11+ (for `flask-api` if you use it)
- Docker (optional, for containerized runs)

Local run (recommended):

1. Backend microservices (each service in `interview-trainer/`) can be started from their module root with:

   mvn spring-boot:run

   or using the provided `mvnw` wrapper on Windows:

   .\mvnw spring-boot:run

2. Frontend (in `interview-trainer-frontend/`):

   - Install deps: `npm install` or `pnpm install`
   - Run dev: `npm run dev` (Next.js will start on default port 3000)

3. Flask utility (in `flask-api/`):

   - Create a virtualenv and install requirements: `python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt`
   - Run: `python app.py`

4. Environment variables

   Each microservice reads configuration from `src/main/resources/application.properties`. For local development you can provide environment-specific overrides via `application-local.properties` or environment variables. Typical variables include database connection strings, JWT secrets, cloud provider keys, and storage credentials.

---

## Docker

Each service includes a `dockerfile` for containerization. To build a service image:

  docker build -t interview-trainer-service-name ./interview-trainer/service-name

Then run with environment variables and linked services (or use docker-compose if you create one).

---

## Deployment

This project is designed to deploy to container platforms (AKS, EKS, or Docker Compose). Recommended pattern:

1. Build each service into a container image.
2. Push images to a private registry.
3. Deploy using Kubernetes manifests or Helm charts.

Note: If you need a deployment manifest, I can generate a basic `docker-compose.yml` or `k8s` manifests for you.

---

## Large files and Git LFS

There are a few large assets (for example `interview-trainer-frontend/components.zip`) that exceed GitHub's recommendation and may be better handled with Git LFS. If you want, I can:

- Setup Git LFS for the repo and migrate large files into LFS (this rewrites history).
- Or remove large binary files from the repo and store them elsewhere.

---

## .gitignore and cleanup

I added a top-level `.gitignore` entry to prevent committing build artifacts, editor folders and heavy runtime artifacts (node_modules, target, .idea, .vscode, __pycache__, etc.).

If you'd like, I can remove accidental binaries (compiled `.pyc` files, IDE workspace files) from the repository history or just from the HEAD and add more precise ignore rules.

---

## Security and secrets

Never commit secrets (JWT keys, DB passwords) into the repository. Use environment variables, a secrets manager, or GitHub Secrets for CI.

---

## Contributing

- Create a feature branch per change: `git checkout -b feat/<short-desc>`
- Run unit tests where available.
- Open a PR with a clear description of changes and any setup steps.

---

## Contact / Next steps I can help with

- Remove compiled files and enforce `.gitignore` (I can run a cleanup commit)
- Convert large files to Git LFS to prevent large history growth
- Generate docker-compose.yml or k8s manifests to run the system locally
- Create a CONTRIBUTING.md with PR and testing guidelines

If you'd like one of those, tell me which and I'll implement it.

---

README generated and committed by automation.
