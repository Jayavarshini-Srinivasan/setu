# SETU

SETU is a job-matching platform for labour and professional workers, with separate experiences for candidates and recruiters. The system includes a React Native mobile app for workers, a React web dashboard for recruiters, and an Express/Firebase backend that powers authentication, job posting, matching, applications, AI voice onboarding, resume generation, learning paths, notifications, and recruiter insights.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Backend API Overview](#backend-api-overview)
- [Mobile App Overview](#mobile-app-overview)
- [Recruiter Web App Overview](#recruiter-web-app-overview)
- [Firebase Setup](#firebase-setup)
- [AI Services](#ai-services)
- [Development Notes](#development-notes)
- [Testing and Utility Scripts](#testing-and-utility-scripts)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

## Features

### Worker Mobile App

- Candidate signup and login with Firebase Authentication.
- Worker type selection for labour and professional users.
- Multi-step onboarding for personal details, role, location, skills, experience, preferences, education, career goals, links, and resume data.
- Voice-based onboarding using audio recording, transcription, and AI profile extraction.
- Job matching based on role, skills, experience, and location.
- Job application flow with application status tracking.
- Notifications for worker activity.
- AI-powered match analysis and explanations.
- Professional learning path generation.
- Resume preview and resume generation.

### Recruiter Web App

- Recruiter signup, login, and onboarding.
- Protected recruiter dashboard.
- Job creation, editing, publishing, pausing, and deletion.
- Recruiter job listing management.
- Applicant review by job.
- Application status updates.
- Candidate detail view.
- Recruiter insights and dashboard statistics.
- Firebase-authenticated API requests.

### Backend

- Express API server.
- Firebase Admin integration for Firestore and authenticated routes.
- Recruiter authorization middleware.
- Job matching service.
- AI services for recommendations, explanations, voice transcription, profile extraction, resume generation, and learning paths.
- Role and location normalization.
- Firestore collections for users, jobs, applications, recruiters, notifications, and AI explanation cache.

## Tech Stack

### Backend

- Node.js
- Express
- Firebase Admin SDK
- Firestore
- Multer for audio upload handling
- Google Generative AI SDK
- Groq SDK
- dotenv
- nodemon for local development

### Mobile

- Expo
- React Native
- React Navigation
- Firebase client SDK
- Axios
- Expo AV for audio recording and playback
- Expo Print and Sharing for document flows

### Web

- React
- Vite
- React Router
- Firebase client SDK
- Axios
- ESLint

## Repository Structure

```text
setu/
├── backend/                  # Express API, Firebase Admin, services, routes, controllers
│   ├── config/               # Firebase Admin configuration
│   ├── controllers/          # Route handlers
│   ├── data/                 # Job, role, skill, and location seed/reference data
│   ├── middleware/           # Auth and recruiter middleware
│   ├── routes/               # Express route definitions
│   ├── scripts/              # Data seeding and migration scripts
│   ├── services/             # Matching, AI, resume, learning, normalization services
│   └── server.js             # Backend entry point
├── mobile/                   # Expo React Native worker app
│   ├── assets/               # App icons and splash assets
│   ├── components/           # Shared UI components
│   ├── constants/            # Theme, skills, translations
│   ├── context/              # Auth, onboarding, language, applied jobs state
│   ├── hooks/                # Shared hooks including voice recorder
│   ├── screens/              # App screens
│   ├── services/             # API and Firebase clients
│   └── utils/                # Validation, formatting, apply helpers
├── web/                      # Vite React recruiter web app
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Shared web UI components
│   │   ├── context/          # Auth context
│   │   ├── hooks/            # Shared hooks
│   │   ├── pages/            # Recruiter pages
│   │   ├── routes/           # App route definitions
│   │   ├── services/         # API service clients
│   │   ├── styles/           # Page/component CSS
│   │   └── utils/            # Formatting, validation, errors
├── SYSTEM_ARCHITECTURE.md    # Detailed system architecture notes
├── package.json              # Root dependencies
└── README.md                 # Project documentation
```

## Prerequisites

Install the following before running the project:

- Node.js 20 or newer recommended.
- npm.
- Expo CLI through `npx expo`.
- Firebase project with Authentication and Firestore enabled.
- Firebase Admin service account JSON for the backend.
- AI provider API keys for the enabled AI features.
- Android Studio, Xcode, Expo Go, or a physical device for mobile testing.

## Environment Setup

This repository does not commit secret files. The `.gitignore` excludes `.env`, `backend/.env`, and `backend/config/serviceAccountKey.json`.

### Backend Environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_google_generative_ai_key
GEMINI_API_KEY_RECOMMENDATION=your_optional_recommendation_key
GEMINI_API_KEY_PROFILE_EXTRACTION=your_optional_profile_extraction_key
GEMINI_MODEL_PROFILE_EXTRACTION=Gemini 2.5 Flash
GROQ_API_KEY=your_groq_key
```

Notes:

- `GEMINI_API_KEY` is the fallback key used by AI services.
- `GEMINI_API_KEY_RECOMMENDATION` is used by the recommendation service when present.
- `GEMINI_API_KEY_PROFILE_EXTRACTION` is used by the profile extraction service when present.
- `GEMINI_MODEL_PROFILE_EXTRACTION` defaults to `Gemini 2.5 Flash` if not set.
- `GROQ_API_KEY` is used for audio transcription.

Add the Firebase Admin service account file at:

```text
backend/config/serviceAccountKey.json
```

### Mobile Environment

Create `mobile/.env`:

```env
API_BASE_URL=http://YOUR_LOCAL_IP:5000
```

Use your machine's LAN IP when testing on a physical mobile device. Do not use `localhost` from a phone, because it points to the phone itself.

Example:

```env
API_BASE_URL=http://192.168.1.10:5000
```

### Web Environment

The recruiter web app currently points to:

```text
http://localhost:5000
```

This is configured in `web/src/services/api.js`.

## Installation

Install dependencies in each app folder:

```bash
cd backend
npm install

cd ../mobile
npm install

cd ../web
npm install
```

The repository also contains a root `package.json`, but the active application scripts live inside `backend`, `mobile`, and `web`.

## Running the Project

Run each part of the system in a separate terminal.

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The API starts on:

```text
http://localhost:5000
```

Health checks:

```text
GET http://localhost:5000/
GET http://localhost:5000/ping
```

### 2. Start the Recruiter Web App

```bash
cd web
npm run dev
```

Vite will print the local web URL, usually:

```text
http://localhost:5173
```

### 3. Start the Mobile App

```bash
cd mobile
npm start
```

Then open the app in Expo Go, an Android emulator, an iOS simulator, or a web preview.

Useful mobile scripts:

```bash
npm run android
npm run ios
npm run web
```

## Backend API Overview

Base URL:

```text
http://localhost:5000
```

### General

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Basic API status message |
| GET | `/ping` | JSON health check |

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Create or register a user profile |
| POST | `/auth/onboard-recruiter` | Complete recruiter onboarding; requires Firebase auth |
| GET | `/auth/profile` | Get authenticated user profile |

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/jobs` | Create a recruiter job |
| GET | `/jobs/recruiter` | Get jobs owned by the authenticated recruiter |
| GET | `/jobs/:jobId` | Get one recruiter job |
| PUT | `/jobs/:jobId` | Update a recruiter job |
| PATCH | `/jobs/:jobId/status` | Toggle job status |
| DELETE | `/jobs/:jobId` | Delete a recruiter job |

Most job routes require Firebase authentication and recruiter access.

### Matching and Applications

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/match` | Match a worker profile against available jobs |
| POST | `/apply` | Apply to a job; requires Firebase auth |
| GET | `/apply/job/:jobId` | Recruiter view of applicants for a job |
| GET | `/apply/:applicationId` | Get one application |
| PATCH | `/apply/:applicationId/status` | Recruiter update of application status |

### AI, Voice, Resume, and Learning

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/voice/upload-audio` | Upload worker audio, transcribe it, and extract profile data |
| POST | `/ai/extract-profile` | Test profile extraction from transcript text |
| POST | `/explain-match` | Generate an AI explanation for a match |
| POST | `/resume/generate` | Generate resume content |
| POST | `/learning/path` | Generate a learning path |

### Recruiter Dashboard, Insights, and Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard/stats` | Recruiter dashboard metrics |
| GET | `/insights` | Recruiter insights |
| GET | `/notifications` | Get authenticated user's notifications |
| PUT | `/notifications/read-all` | Mark all notifications as read |
| PUT | `/notifications/:id/read` | Mark one notification as read |

## Mobile App Overview

The mobile app is the worker-facing experience. It supports both labour and professional user journeys.

Important areas:

- `mobile/App.js` wires the app experience together.
- `mobile/context/AuthContext.js` manages authentication state.
- `mobile/context/OnboardingContext.js` stores onboarding progress.
- `mobile/services/api.js` configures backend API access.
- `mobile/services/firebase.js` configures Firebase client access.
- `mobile/hooks/useVoiceRecorder.js` handles audio recording, upload, transcription, and extracted data.
- `mobile/screens/` contains the main worker screens.
- `mobile/screens/professional/` contains professional-specific onboarding and career screens.

Supported language data is defined in:

```text
mobile/constants/translations.js
```

## Recruiter Web App Overview

The web app is the recruiter-facing experience.

Important areas:

- `web/src/App.jsx` and `web/src/routes/AppRoutes.jsx` define the web app shell and routing.
- `web/src/context/AuthContext.jsx` manages Firebase auth state.
- `web/src/services/api.js` configures API calls and attaches Firebase ID tokens.
- `web/src/pages/DashboardPage.jsx` shows recruiter metrics.
- `web/src/pages/CreateJobPage.jsx` and `web/src/pages/EditJobPage.jsx` manage job posting.
- `web/src/pages/MyJobsPage.jsx` lists recruiter jobs.
- `web/src/pages/ApplicantsPage.jsx` and `web/src/pages/CandidateDetailPage.jsx` support applicant review.
- `web/src/pages/InsightsPage.jsx` displays recruiter insights.

## Firebase Setup

The project uses Firebase in two ways:

1. Client SDK in mobile and web for authentication and Firestore access.
2. Firebase Admin SDK in the backend for trusted server-side Firestore operations and token verification.

Backend Firebase Admin setup lives in:

```text
backend/config/firebase.js
```

Required backend file:

```text
backend/config/serviceAccountKey.json
```

The current client Firebase config is stored in:

```text
mobile/services/firebase.js
web/src/firebase.js
```

Firestore collection details are documented more deeply in `SYSTEM_ARCHITECTURE.md`.

## AI Services

AI-related backend logic lives under:

```text
backend/services/
backend/services/ai/
```

Key files:

- `backend/services/aiService.js` for recommendation-related AI behavior.
- `backend/services/ai/transcriptionService.js` for audio transcription.
- `backend/services/ai/profileExtractionService.js` for profile extraction from transcripts.
- `backend/services/resumeGenerationService.js` for resume generation.
- `backend/services/learningPathService.js` for learning path generation.
- `backend/services/ai/explanationCacheService.js` for match explanation caching.

Voice onboarding flow:

```text
Mobile audio recording
-> POST /voice/upload-audio
-> backend temporary upload
-> transcription
-> profile extraction
-> extracted profile returned to mobile
-> user reviews and confirms data
```

Uploaded audio files are deleted after processing.

## Development Notes

- Start the backend before using the mobile or web app.
- For physical-device mobile testing, set `API_BASE_URL` to your computer's LAN IP and keep the phone on the same network.
- The backend listens on `0.0.0.0:5000`, which allows LAN devices to reach it when firewall rules permit.
- The web app assumes the backend is available at `http://localhost:5000`.
- Firebase ID tokens are attached by the web API client when a user is logged in.
- Recruiter-only backend routes use both `authMiddleware` and `recruiterMiddleware`.
- Do not commit `.env` files or Firebase service account JSON.
- Generated build folders such as `dist/` and `build/` are ignored.

## Testing and Utility Scripts

Backend utility and test files include:

```text
backend/check_db.js
backend/inspect_db.js
backend/test_queue.js
backend/test_learning.js
backend/testRoleNormalization.js
backend/fix_match.js
backend/scripts/seedJobs.js
backend/scripts/seedFirestore.js
backend/scripts/migrateUsers.js
backend/scripts/generateMockData.js
```

Web quality scripts:

```bash
cd web
npm run lint
npm run build
```

Backend development scripts:

```bash
cd backend
npm start
npm run dev
```

Mobile development scripts:

```bash
cd mobile
npm start
npm run android
npm run ios
npm run web
```

## Troubleshooting

### Backend fails to start because `serviceAccountKey.json` is missing

Add the Firebase Admin service account file at:

```text
backend/config/serviceAccountKey.json
```

### Mobile app cannot reach the backend

Check `mobile/.env`:

```env
API_BASE_URL=http://YOUR_LOCAL_IP:5000
```

Also confirm:

- Backend is running.
- Phone and computer are on the same network.
- Firewall allows inbound traffic to port `5000`.
- You restarted Expo after changing `.env`.

### Web app cannot reach the backend

Confirm the backend is running at:

```text
http://localhost:5000
```

The web API base URL is configured in:

```text
web/src/services/api.js
```

### Voice upload or AI extraction fails

Confirm:

- `GROQ_API_KEY` is set in `backend/.env`.
- Gemini API keys are set in `backend/.env`.
- The backend has permission to create and delete files in `backend/uploads`.
- The audio request uses the `audio` form-data field.

### Recruiter routes return unauthorized or forbidden responses

Confirm:

- User is logged in through Firebase.
- Request includes a valid Firebase ID token.
- The user's Firestore profile has recruiter access data expected by `recruiterMiddleware`.

## Related Documentation

For deeper implementation details, see:

```text
SYSTEM_ARCHITECTURE.md
```

That document includes the Firestore schema, voice system design, AI analysis, learning path flow, onboarding process, profile storage, and resume generation architecture.
