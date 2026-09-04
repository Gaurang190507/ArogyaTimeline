# Feature-by-Feature Implementation Prompts

This guide contains self-contained prompts for implementing each feature of the SIH application using Supabase and free AI services. Each prompt is designed to be copy-pasted into Claude Code or similar AI coding assistant to implement that specific feature.

## How to Use These Prompts
1. Start with Phase 1 (Setup) prompts
2. Work through each feature in order
3. Test each feature before moving to the next
4. Use the verification steps provided in each prompt

## Phase 1: Supabase Project Setup

### Prompt 1.1: Create Supabase Project & Initial Setup
```
I need to set up a Supabase project for the SIH healthcare application. Please guide me through:

1. Creating a new Supabase project at supabase.com
2. Setting up the database schema with these tables:
   - health_records (id UUID PK, user_id UUID FK, date DATE, time TIME, type TEXT, metadata JSONB, created_at TIMESTAMPTZ)
   - doctors (id UUID PK, name TEXT, specialty TEXT, phone TEXT, email TEXT, avatar_url TEXT, total_visits INTEGER, visit_history JSONB, created_at TIMESTAMPTZ)
   - appointments (id UUID PK, user_id UUID FK, doctor_id UUID FK, date DATE, time TIME, status TEXT, room TEXT, created_at TIMESTAMPTZ)
   - reminders (id UUID PK, user_id UUID FK, title TEXT, description TEXT, due_date TIMESTAMPTZ, completed BOOLEAN, repeat TEXT, created_at TIMESTAMPTZ)
   - documents (id UUID PK, user_id UUID FK, title TEXT, file_url TEXT, file_format TEXT, thumbnail TEXT, ai_summary TEXT, created_at TIMESTAMPTZ)

3. Setting up Row Level Security (RLS) policies for each table so users can only access their own data
4. Creating Supabase storage bucket called "medical-documents" for PDF uploads
5. Enabling email/password authentication in Supabase Auth

Please provide the SQL commands to create these tables and the exact steps to configure in the Supabase dashboard.
```

### Prompt 1.2: Install Supabase Client & Configure Environment
```
Now I need to set up the Supabase client in my React application. Please help me:

1. Install the Supabase JavaScript client: npm install @supabase/supabase-js
2. Create a .env.local file with:
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
3. Create a supabaseClient.js file in src/services/ that initializes the Supabase client
4. Update the AuthContext.jsx to use Supabase Auth instead of localStorage mock
5. Implement login, signup, getCurrentUser, logout functions using Supabase Auth

Please provide the exact code for each file and the verification steps to test authentication works.
```

## Phase 2: Authentication Implementation

### Prompt 2.1: Replace AuthContext with Supabase Auth
```
Replace the current AuthContext.jsx with a Supabase-based implementation. Please provide:

1. Updated AuthContext.jsx that uses supabase.auth methods
2. Functions for:
   - signInWithEmailPassword(email, password)
   - signUp(email, password, profileData)
   - signOut()
   - getUser()
   - onAuthStateChanged listener
3. Proper error handling and loading states
4. Context values: user, session, loading, signIn, signUp, signOut, updateUser

Please also show how to update the main App.jsx to properly protect routes based on authentication state.
```

### Prompt 2.2: Test Authentication Flow
```
Create a test plan to verify the authentication system works:

1. Test user signup with email/password
2. Test login with those credentials
3. Verify JWT token is properly handled
4. Test protected routes redirect unauthenticated users to login
5. Test logout clears session and redirects to login
6. Test page refresh maintains authentication state

Please provide the exact steps and expected outcomes for each test.
```

## Phase 3: Health Records Implementation

### Prompt 3.1: Create Health Records Service
```
Create a healthRecordService.js that replaces the mock version with Supabase integration. Please provide:

1. Functions for:
   - getAllRecords() - fetches records for current user ordered by date/time desc
   - getRecordById(id)
   - addRecord(recordData) - inserts new health record
   - updateRecord(id, updates)
   - deleteRecord(id)
   - getRecordsByType(type)
   - getStats() - calculates statistics from health records

2. Each function should:
   - Use the supabase client from src/services/supabaseClient.js
   - Include proper error handling
   - Return data in the same format as the mock service
   - Use RLS to ensure users only see their own data

3. The metadata field should store type-specific data like:
   - For blood_pressure: {systolic: number, diastolic: number}
   - For weight: {value: number}
   - etc.

Please provide the complete file content.
```

### Prompt 3.2: Update HealthContext to Use Real Service
```
Update the HealthContext.jsx to use the new healthRecordService instead of mock data. Please provide:

1. Updated HealthContext that:
   - Fetches records on mount and when user changes
   - Provides addRecord, updateRecord, deleteRecord functions
   - Provides getStats function
   - Handles loading and error states
   - Uses React Query or useEffect with proper dependencies

2. Show how to use this context in pages like HomePage.jsx and MedicalRecordsPage.jsx

Please provide the complete updated file.
```

### Prompt 3.3: Test Health Records CRUD Operations
```
Create a verification plan for health records functionality:

1. Test adding a blood pressure record
2. Test adding a weight record
3. Verify records appear in correct order (newest first)
4. Test updating a record
5. Test deleting a record
6. Test filtering by type (getRecordsByType)
7. Verify stats calculation works correctly
8. Test that users can only see their own records (RLS verification)

Please provide exact test steps and expected results.
```

## Phase 4: Doctors & Appointments Implementation

### Prompt 4.1: Create Doctors Service
```
Create a doctorService.js that replaces the mock version with Supabase integration. Please provide:

1. Functions for:
   - getAllDoctors() - returns all doctors (doctors are shared data)
   - getDoctorById(id)
   - addVisitToDoctor(doctorId, visitData) - adds visit to doctor's history
   - (Optional) addDoctor() for admin seeding

2. The visitHistory should store array of visit objects with:
   - id, date, notes, symptoms, diagnosis, prescription

3. Implement proper error handling and return formats matching mock service

Please provide the complete file content.
```

### Prompt 4.2: Create Appointments Service
```
Create an appointmentService.js that replaces the mock version. Please provide:

1. Functions for:
   - getAllAppointments() - gets appointments for current user
   - addAppointment(aptData) - creates new appointment
   - updateAppointment(id, updates)
   - cancelAppointment(id) - sets status to "Cancelled"
   - getAppointmentById(id)

2. Each appointment should link to:
   - user_id (foreign key to auth.users)
   - doctor_id (foreign key to doctors table)

3. Include validation to prevent double-booking (same doctor/time)

Please provide the complete file content.
```

### Prompt 4.3: Test Doctors & Appointments Flow
```
Create verification steps for doctors and appointments:

1. Test fetching list of doctors
2. Test viewing doctor detail page
3. Test adding visit to doctor (increments totalVisits)
4. Test creating new appointment
5. Test viewing appointments list
6. Test cancelling appointment
7. Test updating appointment details
8. Verify RLS prevents users from seeing others' appointments
9. Verify foreign key constraints work correctly

Please provide exact test procedures.
```

## Phase 5: AI Assistant Implementation

### Prompt 5.1: Set Up Groq API Integration
```
Set up Groq API for AI assistant functionality. Please provide:

1. Instructions to get free Groq API key from groq.com
2. Create .env.local entry: VITE_GROQ_API_KEY=your_groq_key
3. Create aiService.js that replaces the mock version with real Groq integration
4. The service should:
   - Accept query and healthRecords array
   - Construct a prompt that includes health context
   - Call Groq API (using fetch to https://api.groq.com/openai/v1/chat/completions)
   - Use model: "llama3-8b-8192" (free tier)
   - Return response in same format as mock service
   - Include proper error handling and loading states

Please provide the complete aiService.js file with example prompt construction.
```

### Prompt 5.2: Enhance AI Service with Context Awareness
```
Improve the AI service to be more context-aware. Please provide:

1. Enhanced prompt engineering that includes:
   - User's recent health records (last 7 days)
   - Trends in vital signs
   - Upcoming appointments
   - Active medications
   - Recent documents

2. Special handling for query types:
   - Blood pressure questions → include BP trends
   - Medicine questions → include current medications
   - Appointment questions → include upcoming visits
   - General health → summarize overall status

3. Follow-up suggestions based on context

Please provide the updated aiService.js with improved prompt templates.
```

### Prompt 5.3: Test AI Assistant Functionality
```
Create verification steps for AI assistant:

1. Test basic health summary query
2. Test blood pressure specific query
3. Test medication query
4. Test appointment query
5. Test general knowledge query
6. Verify response times are reasonable (< 3 seconds)
7. Verify responses include proper disclaimers
8. Test follow-up suggestions work correctly
9. Test error handling when API is unavailable

Please provide exact test prompts and expected response patterns.
```

## Phase 6: Voice Input Implementation

### Prompt 6.1: Implement Real Voice-to-Text
```
Replace the simulated VoiceInput.jsx with real Web Speech API implementation. Please provide:

1. Updated VoiceInput.jsx that:
   - Uses window.SpeechRecognition or webkitSpeechRecognition
   - Requests microphone permission
   - Listens for speech input
   - Converts speech to text in real-time
   - Handles errors (no mic, not supported, etc.)
   - Provides visual feedback for listening/processing states
   - Calls onResult with final transcript when speech ends

2. The component should:
   - Work in Chrome/Edge/Safari (where SpeechRecognition is available)
   - Fallback to simulated behavior if API not available
   - Support multiple languages (en-US, hi-IN, mr-IN based on language context)
   - Include proper cleanup of recognition object

Please provide the complete updated VoiceInput.jsx file.
```

### Prompt 6.2: Test Voice Input Integration
```
Create verification steps for voice input:

1. Test microphone permission request
2. Test speech recognition accuracy with clear speech
3. Test different languages (English, Hindi, Marathi if available)
4. Test that transcript is passed to AI assistant correctly
5. Test error handling when microphone denied
6. Test visual state transitions (IDLE → LISTENING → PROCESSING → RESULT)
7. Test component cleanup when unmounted
8. Verify no memory leaks or event listeners left behind

Please provide exact test procedures.
```

## Phase 7: Document Management Implementation

### Prompt 7.1: Create Document Service with Storage
```
Create a documentService.js that uses Supabase Storage. Please provide:

1. Functions for:
   - getAllDocuments() - gets documents for current user
   - getDocumentById(id)
   - simulateOcrExtraction(fileName, docType) - keep mock OCR for now (we'll enhance later)
   - addDocument(newDoc) - uploads file to Supabase Storage and creates DB record
   - deleteDocument(id)

2. The addDocument function should:
   - Accept file object and metadata
   - Upload file to supabase storage bucket "medical-documents"
   - Get public URL for uploaded file
   - Create document record in database with file_url
   - Generate thumbnail (could be first page preview or default icon)
   - Call OCR extraction function to get aiSummary

3. Use Supabase Storage SDK for uploads

Please provide the complete file content.
```

### Prompt 7.2: Enhance OCR with Tesseract.js
```
Enhance the document service with real OCR capabilities. Please provide:

1. Instructions to install tesseract.js: npm install tesseract.js
2. Update simulateOcrExtraction to use Tesseract for actual OCR when possible
3. For PDF files, use pdf.js + tesseract.js to extract text
4. For images, use tesseract.js directly
5. Generate aiSummary from extracted text using the AI service
6. Handle common medical document formats (PDF, JPG, PNG)

Please provide the updated documentService.js with OCR implementation.
```

### Prompt 7.3: Test Document Upload & Processing
```
Create verification steps for document functionality:

1. Test uploading PDF document
2. Test uploading image document (JPG/PNG)
3. Verify file appears in Supabase Storage bucket
4. Verify document record created in database
5. Test OCR extraction on sample medical document
6. Verify AI summary generated from extracted text
7. Test document deletion removes both file and DB record
8. Test thumbnail generation
9. Test file size and type validation
10. Verify users can only access their own documents

Please provide exact test procedures with sample files.
```

## Phase 8: Reminders Implementation

### Prompt 8.1: Create Reminders Service
```
Create a reminderService.js that replaces the mock version. Please provide:

1. Functions for:
   - getAllReminders() - gets reminders for current user
   - addReminder(reminderData) - creates new reminder
   - toggleComplete(id) - toggles completed status
   - deleteReminder(id) - removes reminder
   - getRemindersDueToday() - helper for showing due reminders

2. ReminderData should include:
   - title, description, due_date (timestamp), repeat pattern ("Once", "Daily", "Weekly", "Monthly")

3. Implement basic recurrence logic:
   - When a repeating reminder is completed, automatically create next instance
   - Handle edge cases (month end, etc.)

Please provide the complete file content.
```

### Prompt 8.2: Test Reminders Functionality
```
Create verification steps for reminders:

1. Test creating one-time reminder
2. Test creating daily repeating reminder
3. Test toggling reminder completion
4. Test deleting reminder
5. Test recurrence logic (when completed, next instance appears)
6. Test filtering reminders by due date
7. Verify RLS prevents access to others' reminders
8. Test edge cases (end of month, daylight saving, etc.)

Please provide exact test procedures.
```

## Phase 9: Real-time Updates & Final Integration

### Prompt 9.1: Add Real-time Subscriptions
```
Add real-time updates using Supabase Realtime. Please provide:

1. Instructions to enable real-time for each table in Supabase dashboard
2. Updated services that:
   - Subscribe to INSERT, UPDATE, DELETE events on relevant tables
   - Update local state when changes occur
   - Handle subscription cleanup on unmount
   - Provide real-time updates to health records, appointments, reminders

3. Show how to use these subscriptions in:
   - HomePage (for live stats updates)
   - MedicalRecordsPage (for live record updates)
   - AppointmentsPage (for live appointment updates)
   - RemindersPage (for live reminder updates)

Please provide code examples for subscription setup in one service.
```

### Prompt 9.2: Final Integration Testing
```
Create a comprehensive final test plan. Please provide:

1. User journey test:
   - Sign up new user
   - Add blood pressure record
   - Add weight record
   - Upload medical document
   - Ask AI assistant about health
   - Use voice input to ask question
   - Schedule appointment with doctor
   - Set medication reminder
   - View doctor profile
   - Check health trends/stats

2. Performance tests:
   - Page load times
   - API response times
   - Concurrent user simulation (if possible)

3. Security tests:
   - Verify RLS prevents data leakage between users
   - Test authentication bypass attempts
   - Test input validation/sanitization

4. Backup and recovery:
   - Test data persistence
   - Test export/import capabilities (if implemented)

Please provide step-by-step test procedures.
```

## Phase 10: Deployment & Optimization

### Prompt 10.1: Prepare for Deployment
```
Provide deployment preparation steps. Please provide:

1. Environment variables checklist for production
2. Build optimization for Vite (npm run build)
3. Supabase production settings checklist
4. Error logging and monitoring setup
5. Performance optimization tips:
   - Database indexing strategies
   - Query optimization
   - Caching strategies for frequent queries
   - Image optimization for thumbnails

Please provide the deployment checklist.
```

### Prompt 10.2: Troubleshooting Guide
```
Create a troubleshooting guide for common issues. Please provide:

1. Authentication issues:
   - "Invalid credentials" errors
   - Token expired problems
   - Session persistence issues

2. Database issues:
   - RLS policy problems
   - Constraint violations
   - Slow query performance

3. Storage issues:
   - Upload failures
   - Permission denied errors
   - File not found errors

4. AI service issues:
   - Groq API rate limiting
   - Network timeout errors
   - Invalid response format

5. Voice input issues:
   - Browser compatibility problems
   - Microphone access denied
   - Speech recognition inaccuracies

Please provide solutions and diagnostic steps for each issue.
```