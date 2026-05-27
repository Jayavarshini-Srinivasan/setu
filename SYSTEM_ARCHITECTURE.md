# SETU System Architecture Documentation

## Table of Contents
1. [Database Schema](#1-database-schema)
2. [Voice System](#2-voice-system)
3. [AI Analysis (UK Data)](#3-ai-analysis-uk-data)
4. [Learning Path System](#4-learning-path-system)
5. [Onboarding Process](#5-onboarding-process)
6. [Profile Storage](#6-profile-storage)
7. [Resume Generation](#7-resume-generation)

---

## 1. Database Schema

### Collections Architecture

```
Firestore Root
├── users/
│   ├── {uid}/
│   │   ├── uid (string)
│   │   ├── email (string)
│   │   ├── workerType (string: 'labour' | 'professional')
│   │   ├── language (string: 'english' | 'hindi' | 'tamil')
│   │   ├── onboardingCompleted (boolean)
│   │   ├── createdAt (timestamp)
│   │   ├── updatedAt (timestamp)
│   │   ├── profile/ (nested object)
│   │   └── notifications/ (subcollection)
│   │
│   └── {uid}/profile/ (nested)
│       ├── === COMMON FIELDS ===
│       ├── fullName (string) - User's display name
│       ├── resumeSummary (string) - Name or summary
│       ├── phoneNumber (string) - Verified contact
│       ├── location (string) - Primary work location
│       ├── canonicalRole (string) - Normalized role from ontology
│       ├── role (string) - User-entered role
│       ├── transcriptHistory (array) - Voice transcript logs
│       │
│       ├── === LABOUR-SPECIFIC ===
│       ├── skills (array<string>) - Labour skills
│       ├── experience (number) - Years of experience
│       ├── age (number) - Optional age
│       ├── workRadius (string) - Travel distance
│       ├── expectedWage (string) - Salary expectations
│       ├── previousWorkType (string) - Industry background
│       ├── availability (string: 'full-time' | 'part-time' | 'flexible')
│       ├── labourData/ (nested object)
│       │   ├── availability (string)
│       │   ├── preferredShift (string: 'morning' | 'afternoon' | 'night')
│       │   └── transportAccess (boolean) - Own vehicle
│       │
│       └── === PROFESSIONAL-SPECIFIC ===
│           ├── professionalRole (string) - Job title
│           ├── email (string) - Work email
│           ├── professionalSkills (array<string>) - Technical skills
│           ├── experienceDetails (array<object>)
│           │   ├── title (string)
│           │   ├── company (string)
│           │   ├── duration (string)
│           │   └── description (string)
│           ├── education/ (object)
│           │   ├── degree (string)
│           │   ├── institution (string)
│           │   ├── graduationYear (string)
│           │   └── fieldOfStudy (string)
│           ├── certifications (array<object>)
│           │   ├── name (string)
│           │   └── issuer (string)
│           ├── linkedin (string) - Profile URL
│           ├── github (string) - Profile URL
│           ├── portfolio (string) - Portfolio URL
│           ├── careerGoal (string) - Target role
│           ├── preferredRoles (array<string>) - Career interests
│           └── expectedSalary (object)
│               ├── min (number)
│               ├── max (number)
│               └── currency (string: 'INR' | 'GBP' | 'USD')
│
├── jobs/
│   ├── {jobId}/
│   │   ├── jobId (string)
│   │   ├── title (string)
│   │   ├── description (string)
│   │   ├── category (string: 'labour' | 'professional')
│   │   ├── role (string) - User-entered role
│   │   ├── canonicalRole (string) - Normalized role
│   │   ├── requiredSkills (array<string>)
│   │   ├── minimumExperience (number)
│   │   ├── location (string)
│   │   ├── salary/ (object)
│   │   │   ├── min (number)
│   │   │   ├── max (number)
│   │   │   ├── currency (string)
│   │   │   └── period (string: 'day' | 'month' | 'year')
│   │   ├── company (string)
│   │   ├── recruiterId (string)
│   │   ├── isActive (boolean)
│   │   ├── isDraft (boolean)
│   │   ├── createdAt (timestamp)
│   │   └── expiresAt (timestamp)
│
├── applications/
│   ├── {appId}/
│   │   ├── appId (string)
│   │   ├── workerId (string)
│   │   ├── jobId (string)
│   │   ├── matchScore (number: 0-100)
│   │   ├── status (string: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted')
│   │   ├── appliedAt (timestamp)
│   │   ├── reviewedAt (timestamp - nullable)
│   │   └── notes (string - optional)
│
├── ai_explanations_cache/
│   ├── {cacheId}/
│   │   ├── profileHash (string) - MD5(profile + language)
│   │   ├── jobId (string)
│   │   ├── language (string)
│   │   ├── explanation (string) - AI-generated match explanation
│   │   ├── timestamp (timestamp)
│   │   └── expiresAt (timestamp - TTL 30 days)
│
└── recruiters/
    ├── {recruiterId}/
    │   ├── recruiterId (string)
    │   ├── companyName (string)
    │   ├── email (string)
    │   ├── verificationStatus (string: 'pending' | 'verified' | 'rejected')
    │   └── createdAt (timestamp)
```

### Field Type Reference

| Type | Example | Usage |
|------|---------|-------|
| `string` | "John Doe" | Names, emails, URLs |
| `number` | 5, 75.5 | Experience, scores, salary |
| `array<string>` | ["React", "Node.js"] | Skills lists |
| `array<object>` | [{title, company, duration}] | Experience history |
| `object` | {min, max, currency} | Structured data |
| `timestamp` | Firestore.Timestamp | Dates and times |
| `boolean` | true/false | Flags and status |

### Document Naming Convention

- **User UID**: Firebase `auth.currentUser.uid` (auto-generated)
- **Job ID**: Custom format: `job_COMPANY_ROLE_TIMESTAMP`
- **App ID**: Auto-generated Firestore document ID
- **Cache ID**: MD5(profileHash + jobId + language)

---

## 2. Voice System

### Architecture Overview

```
Mobile App (React Native)
    ↓
useVoiceRecorder Hook
    ↓ (uploads FormData)
Backend Voice Route
    ↓
Multer (file storage)
    ↓ (transcribe)
Transcription Service (Gemini 2.0 Flash)
    ↓ (extract)
Profile Extraction Service (Gemini 2.0 Flash)
    ↓ (returns JSON)
Response to Mobile
    ↓
OnboardingContext (state merge)
    ↓
Pre-filled form fields
```

### Step 1: Mobile Recording (React Native)

**File**: `mobile/hooks/useVoiceRecorder.js`

**State Machine**:
```
IDLE
  ↓ (startRecording)
RECORDING
  ↓ (stopRecording)
RECORDED [file saved on device]
  ↓ (submitRecording - upload to backend)
PROCESSING [waiting for server]
  ↓ (server returns transcript + extracted data)
CONFIRMED [user reviews extraction]
```

**Key Functions**:

```javascript
startRecording() 
  → Uses Expo.Audio with {
      ios: { extension: '.m4a', outputFormat: 'aac', audioQuality: 'high' },
      android: { outputFormat: 'three_gpp', audioQuality: 'high' }
    }
  → Records to `${RECORDING_PREFIX}${Date.now()}.m4a`

stopRecording()
  → Stops Expo.Audio
  → Returns local file URI

submitRecording(recordingUri)
  → FormData with file + workerType + language
  → POST /voice/upload-audio
  → Sets PROCESSING state

playRecording()
  → Plays recorded audio for review
```

**Output Data Structure**:

```javascript
{
  voiceState: 'CONFIRMED' | 'PROCESSING' | 'RECORDING' | 'IDLE' | 'RECORDED',
  transcript: "I am a delivery driver with 5 years experience",
  extractedProfile: {
    role: 'delivery_driver',
    canonicalRole: 'auto_driver',
    skills: ['driving', 'navigation', 'customer_service'],
    experience: 5,
    location: 'Delhi',
    phoneNumber: '9876543210'
  },
  recordingUri: '/local/path/to/audio.m4a'
}
```

### Step 2: Backend Voice Processing

**File**: `backend/routes/voiceRoutes.js`

**Route**: `POST /voice/upload-audio`

**Middleware Stack**:
```
multer.single('audio')  // Saves to backend/uploads/
  ↓
transcribeAudio()       // Gemini transcription
  ↓
extractProfileData()    // Gemini extraction
  ↓
res.json({success, transcript, extractedProfile})
```

**Multer Configuration**:
```javascript
upload.single('audio') {
  destination: 'backend/uploads/',
  filename: `${Date.now()}_${originalname}`,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true)
    else cb(new Error('Only audio files allowed'))
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
}
```

### Step 3: Transcription Service

**File**: `backend/services/transcriptionService.js`

**Function**: `transcribeAudio(filePath, context?)`

**Process**:
```
1. Read audio file from backend/uploads/{filename}
2. Convert to base64
3. Detect MIME type (m4a → audio/aac, mp3 → audio/mpeg)
4. Call Gemini 2.0 Flash with:
   {
     model: 'gemini-2.0-flash',
     config: {
       temperature: 0.1,
       systemPrompt: "Transcribe audio. Detect language (Hindi/Tamil/Marathi/English/Mixed)"
     },
     media: {
       mimeType: 'audio/{format}',
       data: base64_audio
     }
   }
5. Return transcript or error handling:
   - Silence → "SILENCE"
   - Error → empty string
   - Normal → full transcript
```

**Language Detection**: 
- Gemini detects language automatically
- Returns confidence score
- Supports multi-language audio (e.g., Hindi + English mixed)

**Output**:
```javascript
{
  success: true,
  transcript: "I am a software engineer with 5 years of experience in React and Node.js",
  language: 'English',
  confidence: 0.95
}
```

### Step 4: Profile Extraction Service

**File**: `backend/services/extractionService.js` (or aiService.js)

**Function**: `extractProfileData(transcript, context)`

**Process**:
```
1. Input: 
   {
     transcript: "I am a delivery driver...",
     workerType: 'labour' | 'professional',
     language: 'english' | 'hindi' | 'tamil',
     currentProfile: {...existing profile...}
   }

2. Call Gemini 2.0 Flash with extraction prompt:
   "Extract these fields from transcript: role, skills, experience, location"

3. Parse JSON response with validation:
   - role: match against canonicalRoles
   - skills: normalize against skill taxonomy
   - experience: parse as number
   - location: normalize against locationMap

4. Return extracted profile
```

**Extraction Prompt Template**:
```
You are an expert at understanding worker profiles.
Extract the following information from this transcript:

Transcript: "{transcript}"

Worker Type: {workerType}
Language: {language}

Extract and return ONLY valid JSON (no markdown):
{
  "role": "normalized_role_name",
  "skills": ["skill1", "skill2"],
  "experience": 5,
  "location": "city_name",
  "phoneNumber": "1234567890",
  "availability": "full-time",
  "certifications": [],
  "confidence": 0.85
}

Ensure role matches one of these: [LIST_FROM_ONTOLOGY]
Ensure skills match taxonomy: [SKILL_LIST]
```

**Validation Rules**:
```javascript
{
  role: (str) => CANONICAL_ROLES.includes(str),
  skills: (arr) => arr.every(s => SKILL_TAXONOMY[s]),
  experience: (num) => num >= 0 && num <= 60,
  location: (str) => LOCATION_MAP[str] !== undefined,
  phoneNumber: (str) => /^\d{10}$/.test(str.replace(/\D/g, '')),
  availability: (str) => ['full-time', 'part-time', 'flexible'].includes(str)
}
```

**Output**:
```javascript
{
  success: true,
  transcript: "...",
  extractedProfile: {
    role: 'delivery_driver',
    canonicalRole: 'auto_driver',
    skills: ['driving', 'vehicle_maintenance'],
    experience: 5,
    location: 'Delhi',
    phoneNumber: '9876543210',
    availability: 'full-time',
    confidence: 0.92
  },
  warnings: ["Phone number not found in transcript"]
}
```

### Step 5: Mobile State Integration

**File**: `mobile/context/OnboardingContext.js`

**Flow**:
```
1. Component (e.g., RoleQuestionScreen):
   - User clicks VoiceButton
   - startRecording() called
   
2. After submitRecording():
   - voiceState: 'PROCESSING'
   - UI shows spinner

3. Server responds:
   - voiceState: 'CONFIRMED'
   - extractedProfile received

4. User can:
   - confirmExtraction() → updateField() merges data into OnboardingContext
   - rejectExtraction() → resetToManualInput()

5. Data stored in context:
   {
     role: extractedProfile.role,
     canonicalRole: extractedProfile.canonicalRole,
     skills: extractedProfile.skills,
     experience: extractedProfile.experience,
     location: extractedProfile.location,
     phoneNumber: extractedProfile.phoneNumber,
     availability: extractedProfile.availability
   }
```

### Error Handling

| Scenario | Response | UX |
|----------|----------|-----|
| Silence detected | `{transcript: "SILENCE"}` | "No speech detected. Try again." |
| Audio too quiet | `{transcript: ""}` | "Please speak louder" |
| Network error | Error thrown | "Upload failed. Retry?" |
| Invalid extraction | `{success: false}` | Show manual form |
| Timeout (>30s) | Abort | "Request timed out" |

---

## 3. AI Analysis (UK Data)

### Current System (India-focused)

**Location**: `backend/services/aiService.js`, `backend/services/jobAnalysisService.js`

### Proposed UK Adaptation

#### 3.1 Localization Parameters

```javascript
// backend/config/localizationConfig.js

const UK_CONFIG = {
  // Currency and salary bands
  currency: 'GBP',
  salaryBands: {
    junior: { min: 18000, max: 28000 },
    mid: { min: 28000, max: 45000 },
    senior: { min: 45000, max: 75000 },
    lead: { min: 75000, max: 120000 }
  },

  // Location data
  locationMap: {
    'london': { lat: 51.5074, lng: -0.1278, tier: 1 },
    'manchester': { lat: 53.4808, lng: -2.2426, tier: 2 },
    'birmingham': { lat: 52.5085, lng: -1.8846, tier: 2 },
    'leeds': { lat: 53.8008, lng: -1.5491, tier: 2 },
    // ... more UK cities
  },

  // Work visa categories
  visaRequirements: {
    'UK_Citizen': { code: 'UKC', priority: 1 },
    'Right_to_Work': { code: 'RTW', priority: 2 },
    'Visa_Sponsorship': { code: 'VS', priority: 3 },
    'Skilled_Worker': { code: 'SW', priority: 3 },
    'Graduate_Route': { code: 'GR', priority: 3 }
  },

  // Qualifications recognition
  qualificationEquivalence: {
    'BSc': { ukLevel: 6, ects: 180 },
    'MSc': { ukLevel: 7, ects: 120 },
    'BTech': { ukLevel: 6, ects: 240 },
    'Diploma': { ukLevel: 5, ects: 120 }
  },

  // Industry verticals (UK-specific)
  industries: [
    'Financial_Services', 'Healthcare', 'Technology', 'Manufacturing',
    'Retail', 'Hospitality', 'Education', 'Government', 'Construction'
  ],

  // Minimum wage requirements (April 2024)
  minimumWage: {
    'aged_23_plus': 10.82,
    'aged_21_22': 7.49,
    'aged_18_20': 6.40,
    'under_18': 5.28,
    'apprentice': 4.62
  }
};
```

#### 3.2 AI Analysis Service (UK)

**New Function**: `analyzeJobForUK(profile, job, language)`

```javascript
async analyzeJobForUK(profile, job, language = 'english') {
  // 1. Visa Eligibility Check
  const visaScore = this.calculateVisaCompatibility(
    profile.visaStatus,
    job.visaSponsorship
  );

  // 2. Qualification Matching
  const qualificationScore = this.matchQualifications(
    profile.education,
    job.requiredQualifications,
    profile.country // for recognition
  );

  // 3. Experience Translation
  const experienceScore = this.assessExperienceTransfer(
    profile.experienceDetails,
    job.requiredExperience,
    profile.currentLocation,
    job.location // assess relocation
  );

  // 4. Salary Appropriateness
  const salaryScore = this.calculateSalaryViability(
    profile.expectedSalary,
    job.salary,
    job.location, // London tier 1 vs regional
    profile.yearsExperience
  );

  // 5. Regulatory Compliance
  const complianceFlags = this.checkCompliance(
    profile,
    job,
    job.location
  );

  // 6. Generate Explanation (Multi-language)
  const explanation = await this.generateUKJobExplanation(
    {
      visaScore,
      qualificationScore,
      experienceScore,
      salaryScore,
      profile,
      job
    },
    language
  );

  // 7. Final Match Score (weighted)
  const finalScore = Math.round(
    visaScore * 0.25 +        // Visa eligibility critical
    qualificationScore * 0.25 +
    experienceScore * 0.25 +
    salaryScore * 0.15 +
    (complianceFlags.length === 0 ? 10 : 0) // Bonus for clean compliance
  );

  return {
    matchScore: finalScore,
    recommendation: this.getRecommendation(finalScore),
    breakdown: {
      visa: visaScore,
      qualification: qualificationScore,
      experience: experienceScore,
      salary: salaryScore,
      compliance: complianceFlags
    },
    explanation,
    missingElements: this.identifyGaps(profile, job),
    nextSteps: this.suggestNextSteps(profile, job, visaScore)
  };
}
```

#### 3.3 Visa Eligibility Analysis

```javascript
calculateVisaCompatibility(userVisaStatus, jobVisaSponsorship) {
  const compatibilityMatrix = {
    'UK_Citizen': {
      'No_Sponsorship': 100,
      'Can_Sponsor': 100,
      'Visa_Required': 100
    },
    'Right_to_Work': {
      'No_Sponsorship': 100,
      'Can_Sponsor': 100,
      'Visa_Required': 0
    },
    'Visa_Sponsorship': {
      'No_Sponsorship': 0,
      'Can_Sponsor': 85,
      'Visa_Required': 85
    },
    'Graduate_Route': {
      'No_Sponsorship': 50,
      'Can_Sponsor': 90,
      'Visa_Required': 50
    }
  };

  return compatibilityMatrix[userVisaStatus]?.[jobVisaSponsorship] || 0;
}
```

#### 3.4 Qualification Matching (International Recognition)

```javascript
matchQualifications(profileEducation, jobRequirements, country) {
  // Use UK NARIC/HESA equivalence tables
  // Factor in:
  // - UK degree classification (1st, 2:1, 2:2, 3rd)
  // - International degree recognition
  // - Professional certifications (CCNA, CPA, etc.)

  const matchScore = profileEducation.map(edu => {
    const equivalence = this.getUKEquivalence(edu.degree, edu.institution, country);
    return this.compareAgainstJobRequirement(equivalence, jobRequirements);
  }).reduce((a, b) => a + b, 0) / profileEducation.length;

  return Math.min(100, matchScore * 100);
}
```

#### 3.5 Salary Viability Analysis

```javascript
calculateSalaryViability(expectedSalary, jobSalary, location, yearsExp) {
  const locationTier = UK_CONFIG.locationMap[location]?.tier || 2;
  const locationMultiplier = locationTier === 1 ? 1.2 : 1.0;

  const adjustedJobSalary = jobSalary.min * locationMultiplier;
  const minimumWageReq = this.getMinimumWageForRole(yearsExp);

  if (jobSalary.min < minimumWageReq) {
    return { score: 0, reason: 'Below minimum wage' };
  }

  const salaryGap = expectedSalary - adjustedJobSalary;
  const score = Math.max(0, 100 - Math.abs(salaryGap) / adjustedJobSalary * 100);

  return {
    score: Math.round(score),
    adjustedJobSalary,
    salaryGap,
    viability: score > 70 ? 'viable' : 'negotiate'
  };
}
```

#### 3.6 Compliance Flags

```javascript
checkCompliance(profile, job, location) {
  const flags = [];

  // Right to Work verification
  if (!profile.rightToWorkVerified) {
    flags.push('RTW_UNVERIFIED');
  }

  // DBS (Disclosure and Barring Service) for certain roles
  if (job.requiresDBS && !profile.dbsStatus) {
    flags.push('DBS_REQUIRED');
  }

  // Visa sponsorship viability
  if (job.visaSponsorship === 'No_Sponsorship' && !profile.ukCitizen) {
    flags.push('VISA_SPONSORSHIP_UNAVAILABLE');
  }

  // Professional registration (GDC, NMC, HCPC, etc.)
  if (job.requiresProfessionalReg && !profile.professionalRegistration) {
    flags.push('PROFESSIONAL_REG_REQUIRED');
  }

  return flags;
}
```

#### 3.7 AI Explanation (Multi-language, UK-aware)

**Prompt Template**:
```
Generate a brief 2-sentence job match explanation for a UK job application.

Profile:
- Name: {name}
- Visa Status: {visaStatus}
- Current Location: {location}
- Experience: {yearsExp} years
- Key Skills: {skills}
- Education: {degree} from {institution} ({country})

Job:
- Title: {jobTitle}
- Company: {company}
- Location: {location}
- Salary: £{min}-£{max}
- Visa Sponsorship: {sponsorship}

Match Scores:
- Visa Eligibility: {visaScore}%
- Qualifications: {qualScore}%
- Experience: {expScore}%
- Salary: {salaryScore}%

Language: {language}

Write an encouraging, concise explanation explaining:
1. Why this is a good fit
2. Any action items needed (visa sponsorship, certification, relocation)

Keep to 2 sentences max. Use {language} language.
```

**Example Outputs**:

```
English:
"Your experience in cloud architecture aligns well with their needs, and your £45K 
expectation fits their £42-55K band. You'll need to explore visa sponsorship options 
given your non-UK status."

Hindi:
"आपकी क्लाउड आर्किटेक्चर के अनुभव उनकी जरूरतों के साथ मेल खाते हैं, और आपकी 
£45K की अपेक्षा उनके £42-55K बैंड में फिट बैठती है। आपको अपनी गैर-UK स्थिति 
को देखते हुए वीजा प्रायोजन विकल्पों का पता लगाने की आवश्यकता होगी।"
```

#### 3.8 Location Relocation Impact

```javascript
assessRelocationImpact(currentLocation, jobLocation, profile) {
  const distance = calculateDistance(currentLocation, jobLocation);
  const relocationAllowance = this.estimateRelocationCost(distance);
  
  return {
    relocationNeeded: distance > 25, // miles
    estimatedCost: relocationAllowance,
    salaryAdjustment: this.calculateCostOfLiving(jobLocation) / 
                       this.calculateCostOfLiving(currentLocation),
    couldAffect: 'salary expectations and job viability'
  };
}
```

---

## 4. Learning Path System

### Architecture

```
User Profile
    ↓
Skill Gap Identification
    ↓
Phased Roadmap Generation
    ↓
Learning Resources Mapping
    ↓
Progress Tracking
    ↓
Salary Projection
```

### Data Structure

**File**: `backend/services/learningPathService.js`

```javascript
generateLearningPath(profile, topJob, matchScore, language) {
  return {
    // === METADATA ===
    userId: profile.uid,
    generatedAt: timestamp,
    language,
    targetRole: topJob.title,
    targetCompany: topJob.company,
    currentMatchScore: matchScore,

    // === CURRENT ASSESSMENT ===
    currentAssessment: {
      skills: profile.skills || [],
      experienceYears: profile.experience || 0,
      topJob: {
        title: topJob.title,
        requiredSkills: topJob.requiredSkills,
        salary: topJob.salary
      },
      competencyLevel: assessCompetencyLevel(profile, topJob)
    },

    // === SKILL GAPS ===
    skillGaps: [
      {
        skillName: 'React',
        importance: 'high', // high | medium | low
        reasoning: 'Required by 85% of matched jobs',
        estimatedWeeks: 8,
        resources: [
          {
            type: 'course',
            title: 'React - The Complete Guide',
            platform: 'Udemy',
            duration: '40 hours',
            cost: 'paid',
            url: 'https://...'
          },
          {
            type: 'documentation',
            title: 'React Official Docs',
            platform: 'react.dev',
            duration: 'self-paced',
            cost: 'free'
          }
        ]
      },
      // ... more skills
    ],

    // === ROADMAP PHASES ===
    roadmap: [
      {
        phase: 1,
        name: 'Foundation',
        duration: 2,
        skills: ['Git', 'JavaScript Basics', 'HTML/CSS'],
        description: 'Build core fundamentals needed for web development',
        milestones: [
          'Create first GitHub repository',
          'Build 3 HTML/CSS projects',
          'Complete JavaScript fundamentals course'
        ]
      },
      {
        phase: 2,
        name: 'Core Growth',
        duration: 12,
        skills: ['React', 'Node.js', 'REST APIs', 'Databases'],
        description: 'Develop full-stack capabilities required for the target role',
        cumulativeWeeks: 14, // 2 + 12
        milestones: [
          'Build React project with API integration',
          'Deploy to Vercel/Netlify',
          'Create Node.js backend service'
        ]
      },
      {
        phase: 3,
        name: 'Advanced Specialization',
        duration: 8,
        skills: ['TypeScript', 'Testing', 'DevOps', 'Performance'],
        cumulativeWeeks: 22,
        description: 'Master advanced patterns to stand out',
        milestones: [
          'Contribute to open source project',
          'Build full-stack app with TypeScript',
          'Set up CI/CD pipeline'
        ]
      }
    ],

    // === PROJECTIONS ===
    projections: {
      timelineToGap: '22 weeks',
      completionDate: new Date(Date.now() + 22 * 7 * 24 * 60 * 60 * 1000),
      
      matchScoreProgression: [
        { week: 0, score: matchScore, milestone: 'Current' },
        { week: 4, score: matchScore + 5, milestone: 'Foundation complete' },
        { week: 14, score: matchScore + 15, milestone: 'Core skills gained' },
        { week: 22, score: Math.min(100, matchScore + 25), milestone: 'Advanced ready' }
      ],

      salaryProgression: {
        current: {
          estimate: profile.expectedSalary,
          range: `£${currentMin}-£${currentMax}`,
          role: profile.role
        },
        intermediate: {
          estimate: currentEstimate * 1.15,
          range: `£${int Min}-£${int Max}`,
          role: 'Mid-level ' + targetRole,
          week: 14
        },
        target: {
          estimate: topJob.salary.min * 1.1,
          range: `£${targetMin}-£${targetMax}`,
          role: targetRole,
          week: 22
        }
      }
    },

    // === RECOMMENDED ACTIONS ===
    recommendedActions: [
      {
        priority: 'high',
        action: 'Start React course immediately',
        reasoning: 'Blocking 85% of matched jobs',
        estimatedTime: '8 weeks'
      },
      {
        priority: 'high',
        action: 'Build portfolio project',
        reasoning: 'Demonstrate skills to employers',
        estimatedTime: '4 weeks'
      },
      {
        priority: 'medium',
        action: 'Learn TypeScript',
        reasoning: 'Preferred by senior roles and increases salary by 10-15%',
        estimatedTime: '3 weeks'
      }
    ]
  };
}
```

### Skill Estimation Database

```javascript
// Data stored in backend/data or Firestore subcollection

const SKILL_ESTIMATES = {
  'react': { weeks: 8, level: 'intermediate', prerequisites: ['javascript', 'html-css'] },
  'node.js': { weeks: 6, level: 'intermediate', prerequisites: ['javascript'] },
  'typescript': { weeks: 3, level: 'intermediate', prerequisites: ['javascript'] },
  'docker': { weeks: 4, level: 'intermediate', prerequisites: ['linux-basics'] },
  'kubernetes': { weeks: 6, level: 'advanced', prerequisites: ['docker', 'linux'] },
  'aws': { weeks: 5, level: 'intermediate', prerequisites: ['cloud-basics'] },
  'python': { weeks: 6, level: 'intermediate', prerequisites: ['programming-basics'] },
  'machine-learning': { weeks: 12, level: 'advanced', prerequisites: ['python', 'math'] },
  // ... 100+ skills
};

const LEARNING_RESOURCES = {
  'react': [
    {
      title: 'React - The Complete Guide',
      platform: 'Udemy',
      instructor: 'Maximilian Schwarzmüller',
      rating: 4.8,
      reviews: 450000,
      duration: '40 hours',
      cost: 'paid',
      url: 'https://udemy.com/course/react-the-complete-guide/'
    },
    {
      title: 'React Official Documentation',
      platform: 'react.dev',
      duration: 'self-paced',
      cost: 'free',
      url: 'https://react.dev'
    }
  ]
};
```

### Competency Assessment

```javascript
function assessCompetencyLevel(profile, targetJob) {
  // 0-20: Beginner | 20-40: Elementary | 40-60: Intermediate | 60-80: Advanced | 80-100: Expert

  let score = 0;

  // Experience-based
  if (profile.experience >= 5) score += 20;
  else if (profile.experience >= 2) score += 10;

  // Skill overlap
  const overlapSkills = profile.skills.filter(s => 
    targetJob.requiredSkills.includes(s)
  ).length;
  score += (overlapSkills / targetJob.requiredSkills.length) * 40;

  // Education
  if (profile.education?.degree) score += 15;

  // Certifications
  score += profile.certifications?.length * 5;

  return Math.min(100, score);
}
```

### Update Trigger

Learning path is regenerated when:
1. User completes onboarding
2. User saves profile changes
3. Weekly scheduled refresh
4. User clicks "Regenerate Path"

---

## 5. Onboarding Process

### Flow Diagram

```
App Launch
    ↓
User Authenticated?
    ├─ NO → LanguageSelection → Login/Signup
    └─ YES → Profile Complete?
             ├─ NO → UserTypeSelection (Labour/Professional)
             │       ↓
             │       [TWO PARALLEL FLOWS]
             │
             └─ YES → Main App (Home/Profile/Results tabs)

LABOUR FLOW:
  UserTypeSelection
  ↓
  RoleQuestionScreen (voice support)
  ├─ Input: Full name, age, role, work radius
  ├─ Voice: "I'm a delivery driver..."
  └─ Output: canonicalRole, role, resumeSummary
  ↓
  SkillsQuestionScreen (voice support)
  ├─ Input: Select from predefined labour skills
  └─ Voice: "I know driving, customer service..."
  ↓
  ExperienceQuestionScreen
  ├─ Input: Years of experience
  └─ Validation: 0-60 years
  ↓
  LocationQuestionScreen
  ├─ Input: Primary work location
  └─ Validation: Against locationMap
  ↓
  PreferencesQuestionScreen
  ├─ Input: Availability (full-time/part-time/flexible)
  ├─ Input: Shift preference (morning/afternoon/night)
  └─ Input: Transport access (yes/no)
  ↓
  ReviewOnboardingScreen
  ├─ Display: Summary of all inputs
  ├─ Edit: Allow user to go back and modify
  └─ Save: Update Firestore users/{uid}/profile + set onboardingCompleted=true
  ↓
  App.js detects onboardingCompleted=true → Route to LabourTabs

PROFESSIONAL FLOW:
  UserTypeSelection
  ↓
  ProfessionalRoleScreen
  ├─ Input: Job title (text + voice support)
  └─ Output: professionalRole
  ↓
  SkillsQuestionScreen
  ├─ Input: Multi-select technical skills
  └─ Validation: Against SKILL_TAXONOMY
  ↓
  EducationScreen
  ├─ Input: Degree, Institution, Graduation Year
  └─ Validation: Format and year range
  ↓
  ExperienceScreen
  ├─ Input: Array of {title, company, startDate, endDate, description}
  └─ Calculation: Total years = (endDate - startDate) / 365.25
  ↓
  ProfessionalLinksScreen
  ├─ Input: LinkedIn URL, GitHub URL, Portfolio URL
  └─ Validation: URL format
  ↓
  CareerGoalsScreen
  ├─ Input: Target roles (multi-select)
  └─ Output: preferredRoles, careerGoal (first selected)
  ↓
  ReviewScreen
  ├─ Display: Summary of profile
  └─ Edit: Allow modifications
  ↓
  ResumePreviewScreen
  ├─ AI-generated resume summary
  ├─ Display: How resume will appear to employers
  └─ Edit: Approve or modify
  ↓
  Save: Update Firestore + set onboardingCompleted=true
  ↓
  App.js → Route to ProfessionalTabs
```

### State Management (OnboardingContext)

**File**: `mobile/context/OnboardingContext.js`

```javascript
const initialOnboardingData = {
  // Global
  workerType: '', // 'labour' | 'professional'
  language: 'english',
  transcriptHistory: [], // Voice transcripts

  // Labour-specific
  role: '',
  canonicalRole: '',
  skills: [],
  experience: '',
  age: '',
  phoneNumber: '',
  workRadius: '',
  expectedWage: '',
  previousWorkType: '',
  location: '',
  availability: '', // 'full-time' | 'part-time' | 'flexible'
  preferredShift: '', // 'morning' | 'afternoon' | 'night'

  // Professional-specific
  professionalRole: '',
  email: '',
  experienceBand: '',
  education: {
    degree: '',
    institution: '',
    graduationYear: '',
    fieldOfStudy: ''
  },
  professionalSkills: [],
  experienceDetails: [], // [{title, company, duration, description}]
  linkedin: '',
  github: '',
  portfolio: '',
  careerGoals: '',
  resumeSummary: '',
  certifications: [],
  preferredRoles: []
};

// Context methods
{
  updateField: (fieldName, value) => updateOnboardingData[fieldName] = value,
  addTranscript: (transcriptText) => transcriptHistory.push(transcriptText),
  setFullOnboardingData: (newData) => setOnboardingData(newData),
  resetOnboarding: () => setOnboardingData(getInitialOnboardingData()),
  refreshOnboarding: () => trigger re-render for data synchronization
}
```

### Voice Integration Per Screen

**RoleQuestionScreen**:
```javascript
const [fullName, setFullName] = useState(
  onboardingData.resumeSummary?.split('|')[0] || ''
);

// Voice extraction returns:
{
  role: 'delivery_driver',
  canonicalRole: 'auto_driver',
  resumeSummary: 'John Delivery Driver',
  location: 'Delhi'
}

// On confirmation:
updateField('resumeSummary', extractedProfile.resumeSummary);
updateField('canonicalRole', extractedProfile.canonicalRole);
updateField('role', extractedProfile.role);
```

### Navigation After Onboarding

**File**: `mobile/App.js`

```javascript
// Pseudo-code
if (!onboardingCompleted) {
  // Show onboarding stack
  return <Stack.Navigator>
    <Screen name="UserTypeSelection" />
    <Screen name="RoleQuestion" />
    {/* ... more screens ... */}
    <Screen name="ReviewOnboarding" />
  </Stack.Navigator>
} else {
  // Show main app
  if (workerType === 'professional') {
    return <ProfessionalApp /> // ProfessionalTabs
  } else {
    return <LabourApp /> // LabourTabs
  }
}
```

### Data Persistence During Onboarding

All data is stored in `OnboardingContext` (memory) during the flow. Upon completion, a single `updateDoc` writes all fields to Firestore:

```javascript
// ReviewOnboardingScreen.js - handleComplete()
await updateDoc(doc(db, 'users', uid), {
  workerType: 'labour',
  onboardingCompleted: true,
  'profile.role': onboardingData.role,
  'profile.canonicalRole': onboardingData.canonicalRole,
  'profile.skills': onboardingData.skills,
  'profile.experience': onboardingData.experience,
  'profile.location': onboardingData.location,
  'profile.phoneNumber': onboardingData.phoneNumber,
  'profile.resumeSummary': onboardingData.resumeSummary,
  'profile.labourData': {
    availability: onboardingData.availability,
    preferredShift: onboardingData.preferredShift
  },
  'profile.transcriptHistory': onboardingData.transcriptHistory
});
```

---

## 6. Profile Storage

### Data Flow

```
Firestore Document (users/{uid})
    ↓
ProfileScreen (fetchProfile)
    ↓
Local State (useState)
    ↓
UI Rendering (header card, fields, stats)
    ↓
Edit Button → setFullOnboardingData + navigate("Onboarding")
    ↓
User Edits Profile
    ↓
Save → updateDoc(profile fields)
    ↓
refreshOnboarding() → ProfileScreen fetches updated data
```

### Firestore Document Structure

```javascript
// users/{uid}
{
  uid: 'firebase_uid_123',
  email: 'user@example.com',
  workerType: 'labour', // or 'professional'
  language: 'english',
  onboardingCompleted: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  profile: {
    // === Common ===
    fullName: 'John Smith',
    resumeSummary: 'John Smith | Delivery Driver',
    phoneNumber: '01234567890',
    location: 'London',
    transcriptHistory: [
      'I am a delivery driver with 5 years experience',
      'I know London well'
    ],

    // === Labour ===
    role: 'delivery_driver',
    canonicalRole: 'auto_driver',
    skills: ['driving', 'navigation', 'customer_service'],
    experience: 5,
    age: 35,
    workRadius: '5 km',
    expectedWage: '400/day',
    previousWorkType: 'self-employed',
    availability: 'full-time',
    labourData: {
      preferredShift: 'morning',
      transportAccess: true
    }

    // === Professional ===
    professionalRole: 'Senior React Developer',
    professionalSkills: ['React', 'Node.js', 'TypeScript'],
    experienceDetails: [
      {
        title: 'Senior Developer',
        company: 'TechCorp Ltd',
        startDate: '2021-01-15',
        endDate: '2024-05-31',
        description: 'Led React migration project'
      }
    ],
    education: {
      degree: 'BSc Computer Science',
      institution: 'University of London',
      graduationYear: '2019',
      fieldOfStudy: 'Computer Science'
    },
    email: 'john@email.com',
    linkedin: 'https://linkedin.com/in/johnsmith',
    github: 'https://github.com/johnsmith',
    portfolio: 'https://johnsmith.dev',
    careerGoal: 'Tech Lead',
    preferredRoles: ['Tech Lead', 'Architect', 'Engineering Manager'],
    certifications: [
      {
        name: 'AWS Solutions Architect',
        issuer: 'Amazon'
      }
    ]
  }
}
```

### ProfileScreen Display Logic

**File**: `mobile/screens/ProfileScreen.js`

#### 1. Fetch Profile

```javascript
const fetchProfile = async () => {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    setProfile(snap.data());
    fetchMatchData(snap.data()); // Get current match score
  }
};

useEffect(() => {
  fetchProfile();
}, [onboardingRefresh]); // Re-fetch when profile edited
```

#### 2. Display Name Derivation

```javascript
const getDisplayName = () => {
  const p = profile?.profile || {};
  const emailName = auth.currentUser?.email?.split('@')[0] || 'User';
  
  const rawName = p.fullName || p.name || 
                  p.resumeSummary?.split('|')[0] || 
                  emailName;
  
  // Format: capitalize words
  return rawName
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
```

#### 3. Profile Readiness Score

```javascript
const computeProfileReadiness = (profile, isProfessional, matchScore) => {
  let score = 0;

  if (isProfessional) {
    if (profile.professionalRole) score += 20;
    if ((profile.professionalSkills?.length || 0) >= 3) score += 25;
    if (profile.education?.degree) score += 15;
    if ((profile.experienceDetails?.length || 0) > 0) score += 15;
    if (profile.careerGoal || profile.preferredRoles?.length > 0) score += 10;
    if (profile.linkedin || profile.github) score += 15;
  } else {
    if (profile.canonicalRole || profile.role) score += 25;
    if ((profile.skills?.length || 0) >= 2) score += 25;
    if (profile.experience) score += 20;
    if (profile.location) score += 15;
    if (profile.availability) score += 15;
  }

  // Blend with match score
  const blended = Math.round(score * 0.7 + matchScore * 0.3);
  return Math.min(100, blended);
};
```

#### 4. AI Summary Generation

```javascript
const buildAiSummary = (profile, isProfessional, matchScore, topJob) => {
  const role = isProfessional 
    ? profile.professionalRole 
    : profile.canonicalRole || profile.role;

  let summary = `${role} based in ${profile.location} 
                 with ${profile.skills?.length} verified skills`;
  
  if (profile.experience > 0) 
    summary += ` and ${profile.experience} years of experience`;

  if (matchScore >= 80 && topJob) {
    summary += `. Strong match for ${topJob.title} (${matchScore}% match).`;
  }

  return summary;
};
```

#### 5. Edit Profile Flow

```javascript
const handleEditProfile = async () => {
  // 1. Fetch latest user data from Firestore
  const snap = await getDoc(doc(db, 'users', user.uid));
  
  // 2. Map Firestore profile to OnboardingContext structure
  if (snap.exists()) {
    setFullOnboardingData(mapUserDocToOnboardingData(snap.data()));
  }
  
  // 3. Mark as incomplete to re-enter onboarding
  await updateDoc(doc(db, 'users', user.uid), { 
    onboardingCompleted: false 
  });
  
  // 4. Trigger refresh
  refreshOnboarding();
  
  // 5. Navigate to UserTypeSelection (or role screen based on workerType)
  navigation.navigate('UserTypeSelection');
};
```

### Mapping Function

```javascript
const mapUserDocToOnboardingData = (userData) => {
  const profileData = userData?.profile || {};
  const workerType = userData?.workerType || 'labour';
  const nameValue = profileData.fullName || 
                    profileData.name || 
                    profileData.resumeSummary || '';

  return {
    workerType,
    language: userData?.language || 'english',
    transcriptHistory: profileData.transcriptHistory || [],
    
    // Labour fields
    role: profileData.role || '',
    canonicalRole: profileData.canonicalRole || '',
    skills: profileData.skills || [],
    experience: profileData.experience?.toString() || '',
    location: profileData.location || '',
    availability: profileData.availability || '',
    phoneNumber: profileData.phoneNumber || '',
    
    // Professional fields
    professionalRole: profileData.professionalRole || '',
    professionalSkills: profileData.professionalSkills || [],
    experienceDetails: profileData.experienceDetails || [],
    education: profileData.education || {},
    linkedin: profileData.linkedin || '',
    github: profileData.github || '',
    portfolio: profileData.portfolio || '',
    careerGoals: profileData.careerGoal || '',
    preferredRoles: profileData.preferredRoles || [],
    
    // Name
    resumeSummary: nameValue
  };
};
```

---

## 7. Resume Generation

### Architecture

```
Professional Profile
    ↓
Extract Profile Data
    ↓
Generate AI Summary
    ↓
Compile Resume Object
    ↓
Format for Display (Web/PDF/Download)
```

### Service Implementation

**File**: `backend/services/resumeGenerationService.js`

```javascript
async generateResume(uid, language = 'english') {
  // 1. Fetch user profile from Firestore
  const userSnap = await getDoc(doc(db, 'users', uid));
  const userData = userSnap.data();
  const profile = userData.profile;

  // 2. Extract and transform data
  const resume = {
    // Basic Info
    name: profile.fullName || profile.resumeSummary?.split('|')[0],
    title: profile.professionalRole,
    email: profile.email,
    location: profile.location,
    phone: profile.phoneNumber,
    links: {
      linkedin: profile.linkedin,
      github: profile.github,
      portfolio: profile.portfolio
    },

    // 3. Generate AI Summary
    summary: await generateProfessionalSummary(profile, language),

    // 4. Skills Section
    skills: this.formatSkills(profile.professionalSkills),

    // 5. Experience Section
    experience: profile.experienceDetails.map(exp => ({
      title: exp.title,
      company: exp.company,
      duration: this.formatDuration(exp.startDate, exp.endDate),
      description: exp.description
    })),

    // 6. Education Section
    education: {
      degree: profile.education.degree,
      institution: profile.education.institution,
      graduationYear: profile.education.graduationYear,
      field: profile.education.fieldOfStudy
    },

    // 7. Certifications
    certifications: profile.certifications || [],

    // 8. Metadata
    generatedAt: new Date(),
    version: 1
  };

  return resume;
}
```

### AI Summary Generation

**Prompt Template**:

```
Generate a professional 3-4 sentence resume summary for a {role} position.

Profile:
- Current Role: {currentRole}
- Years of Experience: {yearsExp}
- Key Skills: {skills}
- Education: {degree} in {field}
- Achievements: {certifications}

Write a compelling summary that:
1. States professional identity and expertise area
2. Highlights unique value proposition
3. Mentions key accomplishments or areas of excellence
4. Shows career trajectory or aspirations

Language: {language}

Keep to 3-4 sentences. Make it impactful and professional.
```

**Example Output** (English):

```
Experienced Senior React Developer with 5+ years building scalable 
web applications for Fortune 500 companies. Expert in modern JavaScript, 
TypeScript, and cloud architecture with a track record of leading 
cross-functional teams. AWS Solutions Architect certified with proven 
ability to reduce deployment time by 40% through CI/CD automation.
```

**Example Output** (Hindi):

```
फॉर्च्यून 500 कंपनियों के लिए स्केलेबल वेब एप्लिकेशन बनाने में 
5+ वर्षों का अनुभव प्राप्त सीनियर रिएक्ट डेवलपर। आधुनिक जावास्क्रिप्ट, 
टाइपस्क्रिप्ट और क्लाउड आर्किटेक्चर में विशेषज्ञ। AWS सॉल्यूशंस 
आर्किटेक्ट प्रमाणित, CI/CD ऑटोमेशन के माध्यम से डिप्लॉयमेंट समय 
40% तक कम करने का सिद्ध ट्रैक रिकॉर्ड।
```

### Resume Display Component

**File**: `mobile/screens/professional/ResumePreviewScreen.js`

```javascript
const ResumePreviewScreen = ({ navigation }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      const uid = auth.currentUser.uid;
      const resumeData = await API.get(`/resume/${uid}`);
      setResume(resumeData);
      setLoading(false);
    };
    fetchResume();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.title}>{resume.title}</Text>
        <Text style={styles.location}>{resume.location}</Text>
      </View>

      {/* Contact */}
      <View style={styles.contact}>
        <Text>{resume.email}</Text>
        <Text>{resume.phone}</Text>
        {resume.links.linkedin && <Text>{resume.links.linkedin}</Text>}
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text>{resume.summary}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {resume.experience.map((exp, i) => (
          <View key={i} style={styles.expItem}>
            <Text style={styles.expTitle}>{exp.title}</Text>
            <Text style={styles.expCompany}>{exp.company}</Text>
            <Text style={styles.expDuration}>{exp.duration}</Text>
            <Text>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {resume.skills.map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text>{resume.education.degree}</Text>
        <Text>{resume.education.institution}</Text>
      </View>

      {/* Download Button */}
      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF}>
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

### PDF Generation (Backend)

**Route**: `GET /resume/:uid/download`

```javascript
async downloadResumePDF(uid, format = 'pdf') {
  // 1. Generate resume
  const resume = await generateResume(uid);

  // 2. Use puppeteer or similar to convert HTML to PDF
  const html = this.renderResumeHTML(resume);
  const pdf = await convertHTMLToPDF(html);

  // 3. Return as download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${uid}.pdf"`);
  res.send(pdf);
}
```

### Resume Template (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    .name { font-size: 24px; font-weight: bold; }
    .title { font-size: 14px; color: #0066cc; }
    .section { margin-top: 15px; }
    .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; }
    .exp-item { margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">{name}</div>
    <div class="title">{title}</div>
    <div class="location">{location}</div>
    <div class="contact">{email} | {phone}</div>
  </div>

  <div class="section">
    <div class="section-title">PROFESSIONAL SUMMARY</div>
    <p>{summary}</p>
  </div>

  <div class="section">
    <div class="section-title">EXPERIENCE</div>
    {experience.map(exp => `
      <div class="exp-item">
        <strong>${exp.title}</strong> at ${exp.company}
        <div>${exp.duration}</div>
        <p>${exp.description}</p>
      </div>
    `)}
  </div>

  <div class="section">
    <div class="section-title">SKILLS</div>
    <p>{skills.join(', ')}</p>
  </div>

  <div class="section">
    <div class="section-title">EDUCATION</div>
    <p><strong>${education.degree}</strong></p>
    <p>${education.institution}, ${education.graduationYear}</p>
  </div>

  {certifications.length > 0 && `
    <div class="section">
      <div class="section-title">CERTIFICATIONS</div>
      ${certifications.map(cert => `<p>${cert.name} - ${cert.issuer}</p>`)}
    </div>
  `}
</body>
</html>
```

### API Endpoint

```javascript
// backend/routes/resumeRoutes.js

router.get('/:uid', async (req, res) => {
  const resume = await generateResume(req.params.uid);
  res.json(resume);
});

router.get('/:uid/download', async (req, res) => {
  const pdf = await downloadResumePDF(req.params.uid);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
});

router.post('/:uid/regenerate', async (req, res) => {
  // Force regenerate summary from Gemini
  const resume = await generateResume(req.params.uid, req.body.language);
  res.json(resume);
});
```

---

## Integration Summary

### Complete Data Flow Example

**Scenario**: New UK professional user signs up and completes onboarding

```
1. SignupScreen
   ├─ fullName: "Sarah Johnson"
   └─ Creates Firestore user doc: users/{uid}

2. LanguageSelection
   └─ Selects: English

3. UserTypeSelection
   └─ Selects: Professional

4. ProfessionalOnboarding
   ├─ ProfessionalRoleScreen: "Senior React Developer"
   ├─ SkillsScreen: ["React", "TypeScript", "Node.js"]
   ├─ EducationScreen: "BSc Computer Science, University of London"
   ├─ ExperienceScreen: [
   │   {title: "React Developer", company: "TechCorp", 2020-2023},
   │   {title: "Senior Developer", company: "StartupXYZ", 2023-2024}
   │ ]
   ├─ LinksScreen: [LinkedIn, GitHub, Portfolio URLs]
   ├─ CareerGoalsScreen: ["Tech Lead", "Architect"]
   └─ OnboardingContext populated with all data

5. ReviewOnboardingScreen
   └─ updateDoc(users/{uid}) {
       workerType: 'professional',
       onboardingCompleted: true,
       profile: {
         professionalRole: "Senior React Developer",
         professionalSkills: [...],
         experienceDetails: [...],
         fullName: "Sarah Johnson",
         resumeSummary: "Sarah Johnson | Senior React Developer",
         ...
       }
     }

6. App.js
   └─ Detects onboardingCompleted=true
      └─ Routes to ProfessionalApp/Tabs

7. HomeScreen (Professional)
   ├─ fetchProfile() → gets users/{uid}
   ├─ Displays: "Good afternoon Sarah" with initials
   ├─ Shows: "Senior React Developer based in London"
   └─ Calls /match API → gets job matches

8. ProfileScreen
   ├─ Fetches profile data
   ├─ Computes readiness: 75% (role + skills + exp complete)
   ├─ Generates AI summary via Gemini
   ├─ Edit Profile:
   │  ├─ setFullOnboardingData(mapUserDoc(...))
   │  └─ Navigate to UserTypeSelection
   └─ Updates reflected on next refresh

9. ResumePreviewScreen
   ├─ Calls /resume/{uid}
   ├─ Backend generates:
   │  ├─ AI professional summary
   │  ├─ Formats experience, skills, education
   │  └─ Returns structured resume
   └─ User downloads as PDF
```

---

## Security Considerations

### Auth & Permissions
- Firebase Auth for identity
- Firestore security rules: User can only access their own profile
- Voice files: Uploaded to backend, deleted after processing

### Data Privacy
- Voice transcripts stored in profile for training/context only
- PII (phone, email) encrypted in Firestore
- Salary data stored with user, not shared publicly

### Compliance (UK/GDPR)
- Right to data deletion: `DELETE /user/{uid}` endpoint
- Data portability: Export profile and resume as JSON
- Consent management: Store in user document which services were consented to

---

## Monitoring & Analytics

### Key Metrics
- Onboarding completion rate (labour vs professional)
- Average time per screen
- Voice recognition accuracy
- Profile completeness score distribution
- Match score improvements over time

### Logging
- Voice transcription quality metrics
- AI extraction confidence scores
- Resume generation success/failure
- Profile edit frequency

---

## Future Enhancements

1. **Multi-language Resume**: Generate resume in multiple languages
2. **Profile Verification**: Video verification for higher-tier jobs
3. **Skills Assessment**: Automated quizzes to verify claimed skills
4. **Referral Program**: Share profile link with unique ID
5. **Job Alert Subscriptions**: Email/SMS for matching jobs
6. **Integration with LinkedIn**: Auto-import profile data
7. **Interview Preparation**: AI mock interviews for job candidates

