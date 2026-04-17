# Interview Trainer Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2024.0.0-blue.svg)](https://spring.io/projects/spring-cloud)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-red.svg)](https://redis.io/)

> An AI-powered mock interview platform that connects job seekers with experienced interviewers and provides intelligent question generation, real-time feedback, and performance scoring.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Microservices](#microservices)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

**Interview Trainer** is a comprehensive platform designed to help job seekers prepare for technical and behavioral interviews through:

- **AI-Generated Questions**: Smart question generation based on industry and role
- **Peer-to-Peer Interviews**: Connect with experienced interviewers
- **Real-Time AI Feedback**: Get instant analysis and scoring
- **Performance Tracking**: Monitor progress over time

The platform serves two primary user types:
- **Interviewees**: Job seekers looking to practice and improve their interview skills
- **Interviewers**: Experienced professionals offering mock interview sessions

---

## Key Features

### For Interviewees
- **AI-Powered Mock Interviews** - Practice with dynamically generated questions tailored to specific roles and industries
- **Real Person Interviews** - Schedule and conduct live video interviews with experienced interviewers
- **Performance Analytics** - Track confidence scores, completion rates, and overall performance metrics
- **Session Recording & Review** - Access past interviews for self-assessment
- **Smart Scheduling** - Book interviews with available interviewers based on expertise

### For Interviewers
- **Expert Profile Management** - Showcase expertise, industry focus, and availability
- **Rating & Review System** - Build reputation through candidate feedback
- **Flexible Scheduling** - Set available time slots for mock interviews
- **Performance Insights** - View interview statistics and impact metrics

### AI & Automation
- **Gemini AI Integration** - Advanced question generation and answer analysis
- **Automated Scoring** - AI-powered performance evaluation
- **Real-Time Processing** - Live feedback during interview sessions

---

## Architecture

The platform follows a **microservices architecture** with service discovery, API gateway, and event-driven communication patterns.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Port: 8081)                      │
│              - Request Routing  - Load Balancing                  │
│              - Authentication   - Rate Limiting                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Service Registry (Eureka)                        │
│                    (Port: 8761)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ User Service │   │  Interview   │   │   Question   │
│   (8085)     │   │   Session    │   │  Generation  │
│              │   │   (8090)     │   │   (8087)     │
└──────────────┘   └──────────────┘   └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│Auth Service  │   │  Feedback &  │   │  Processing  │
│   (8088)     │   │   Scoring    │   │   (8084)     │
│              │   │   (8082)     │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Notification │   │    Storage   │   │              │
│   (8083)     │   │   (8086)     │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## Microservices

| Service | Port | Description | Database | Key Technologies |
|---------|------|-------------|----------|------------------|
| **Service Registry** | 8761 | Eureka server for service discovery | N/A | Netflix Eureka |
| **API Gateway** | 8081 | Spring Cloud Gateway for routing | N/A | Spring Gateway, WebFlux |
| **User Service** | 8085 | User management, authentication, profiles | PostgreSQL | JPA, Redis, JWT |
| **Auth Service** | 8088 | OAuth2, JWT token management, Cloudinary | N/A | Spring Security, Cloudinary |
| **Interview Session Service** | 8090 | Session scheduling, LiveKit integration, WebSocket | PostgreSQL (R2DBC) | WebSocket, LiveKit, Kafka |
| **Question Generation Service** | 8087 | AI-powered question generation | PostgreSQL | Gemini AI |
| **Processing Service** | 8084 | Video/audio processing, Flask integration | PostgreSQL | Multipart, Async |
| **Feedback & Scoring Service** | 8082 | AI analysis and scoring | PostgreSQL | Keycloak |
| **Notification Service** | 8083 | Email notifications | PostgreSQL | JavaMail |
| **Storage Service** | 8086 | File storage management | PostgreSQL | Keycloak |

---

## Technology Stack

### Backend
- **Java 21** - Latest LTS version with virtual threads support
- **Spring Boot 3.4.2** - Microservices framework
- **Spring Cloud 2024.0.0** - Service discovery, gateway, Feign clients
- **Spring Security** - JWT and OAuth2 authentication
- **Spring Data JPA/R2DBC** - Data persistence

### Databases & Caching
- **PostgreSQL** - Primary relational database
- **Redis** - Distributed caching and session management

### AI & External Services
- **Google Gemini AI** - Question generation and answer analysis
- **LiveKit** - Real-time video/audio for interviews
- **Cloudinary** - Image upload and management
- **Flask API** - Python-based media processing

### Communication
- **Kafka** - Event streaming for async processing
- **WebSocket** - Real-time chat and notifications
- **Spring OpenFeign** - Inter-service communication

### Infrastructure
- **Netflix Eureka** - Service registry and discovery
- **Spring Cloud Gateway** - API gateway with reactive programming
- **Maven** - Build and dependency management

---

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.8+
- PostgreSQL 14+
- Redis 7+
- Kafka (for event streaming)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leul120/interview-trainer.git
   cd interview-trainer
   ```

2. **Start Infrastructure Services**
   ```bash
   # Start PostgreSQL
   # Start Redis
   # Start Kafka (if using event streaming)
   ```

3. **Set Environment Variables**
   Create a `.env` file or set the following environment variables:
   ```bash
   export DB_URL=jdbc:postgresql://localhost:5432/interview-trainer
   export DB_USER=postgres
   export DB_PWD=your-password
   export EUREKA_CLIENT_SERVICE_URL=http://localhost:8761/eureka
   export REDIS_HOST=localhost
   export GEMINI_API_KEY=your-gemini-api-key
   export LIVE_KIT_API_KEY=your-livekit-key
   export LIVE_KIT_API_SECRET=your-livekit-secret
   export CLOUDINARY_CLOUD_NAME=your-cloud-name
   export CLOUDINARY_API_KEY=your-api-key
   export CLOUDINARY_API_SECRET=your-api-secret
   export FLASK_API=http://localhost:5000
   export MAIL_PASSWORD=your-email-password
   ```

4. **Build All Services**
   ```bash
   # Build each service
   cd service-registry && mvn clean install
   cd ../apiGateway && mvn clean install
   cd ../userService && mvn clean install
   cd ../authService && mvn clean install
   cd ../interviewSessionService && mvn clean install
   cd ../questionGenerationService && mvn clean install
   cd ../processingService && mvn clean install
   cd ../feedbackAndScoringService && mvn clean install
   cd ../notificationService && mvn clean install
   cd ../storageService && mvn clean install
   ```

5. **Run Services** (Start in order)
   ```bash
   # 1. Service Registry
   cd service-registry && mvn spring-boot:run
   
   # 2. API Gateway
   cd apiGateway && mvn spring-boot:run
   
   # 3. Other Services (in any order)
   cd userService && mvn spring-boot:run
   cd authService && mvn spring-boot:run
   cd interviewSessionService && mvn spring-boot:run
   # ... etc
   ```

---

## API Documentation

### User Service API (`/api/v1/user`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/signin` | Authenticate user |
| POST | `/refresh` | Refresh JWT token |
| GET | `/get-user/{email}` | Get user by email |
| GET | `/get-user-by-id` | Get current user |
| GET | `/public/get-interviewers` | List all interviewers |
| POST | `/update-user/{id}` | Update user profile |
| GET | `/online-status/{status}` | Set online status |

### Interview Session API (`/api/v1/session`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/start-session/{scheduleId}` | Start interview session |
| GET | `/start-ai-session/{title}` | Start AI-powered session |
| GET | `/join-session/{scheduleId}/{sessionId}` | Join scheduled interview |
| GET | `/end-session/{sessionId}` | End interview session |
| POST | `/schedule-interview` | Schedule new interview |
| GET | `/get-my-sessions` | Get user's sessions (paginated) |
| GET | `/get-my-scheduled-interviews` | Get scheduled interviews |

---

## Database Schema

### Core Entities

```
User
├── id (UUID, PK)
├── email (String, Unique)
├── password (String)
├── name (String)
├── role (Enum: ADMIN, INTERVIEWEE)
├── type (UserType)
├── profilePicture (String)
├── expertise (List<String>)
├── industry (String)
├── availabilityStatus (Enum)
├── averageRating (Double)
├── reviewCount (Integer)
├── completedInterviews (Integer)
├── overallPerformanceScore (Double)
├── confidenceScore (Double)
├── isSubscribed (Boolean)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)

InterviewSession
├── id (UUID, PK)
├── title (String)
├── intervieweeId (UUID, FK)
├── interviewerId (UUID, FK)
├── status (Enum: SCHEDULED, ONGOING, COMPLETED, CANCELED)
├── room (String)
├── token (String)
├── startedAt (Timestamp)
└── endedAt (Timestamp)

ScheduledInterview
├── id (UUID, PK)
├── intervieweeId (UUID, FK)
├── interviewerId (UUID, FK)
├── scheduledAt (Timestamp)
└── duration (Duration)
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | Yes | PostgreSQL connection string |
| `DB_USER` | Yes | Database username |
| `DB_PWD` | Yes | Database password |
| `EUREKA_CLIENT_SERVICE_URL` | Yes | Eureka server URL |
| `REDIS_HOST` | Yes | Redis server hostname |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `LIVE_KIT_API_KEY` | For video | LiveKit API key |
| `LIVE_KIT_API_SECRET` | For video | LiveKit API secret |
| `CLOUDINARY_CLOUD_NAME` | For images | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For images | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For images | Cloudinary API secret |
| `FLASK_API` | For processing | Flask processing service URL |
| `MAIL_PASSWORD` | For emails | Email service password |

---

## Deployment

### Production Considerations

1. **Service Registry**: Deploy first and ensure it's accessible to all services
2. **Database**: Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
3. **Redis**: Use managed Redis (Redis Cloud, AWS ElastiCache)
4. **API Gateway**: Configure SSL/TLS and rate limiting
5. **Monitoring**: Implement health checks and metrics collection

### Render Deployment (Current)

The service registry is deployed at:
- **URL**: `https://service-registry-46p5.onrender.com`

Individual services can be deployed to Render, AWS, or any cloud provider supporting Java applications.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For support, email codeetgo@gmail.com or open an issue in the repository.

---

## Acknowledgments

- Spring Boot and Spring Cloud teams for the excellent microservices framework
- Google Gemini AI for powering intelligent question generation
- LiveKit for real-time video infrastructure
