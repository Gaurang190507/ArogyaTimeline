# SIH Backend Implementation Roadmap

## Project Overview
This is a healthcare memory application where users can track their health data, interact with AI assistance, and manage medical records. The frontend is already built with React, but we need to replace the mock data with real backend services.

## Tech Stack Decision
We'll use **Supabase** as our backend platform because:
- Free tier includes PostgreSQL database, Auth, Storage, Edge Functions
- Built-in Realtime, Row-Level Security (RLS)
- Python/JS/TS Edge Functions for custom logic
- Great documentation and CLI tools

For AI/Voice/OCR functionality, we'll use:
- **Web Speech API** (browser-based voice-to-text, free)
- **Groq API** (free LLM inference, faster and cheaper than OpenAI)
- **pdf.js** + **Tesseract OCR** (for document processing, both open source)

## Project Structure Breakdown

### 1. Authentication (Auth Context)
- **Current**: Uses localStorage with mock JWT
- **Backend**: Supabase Auth with email/password and magic links
- **Tables**: `auth.users` (Supabase-managed)

### 2. User Profile & Health Records
- **Current**: Mock data in localStorage
- **Backend**: Supabase `health_records` table
- **Tables**: 
  - `health_records` (id, user_id, date, time, type, metadata, user_id)
  - Types: blood_pressure, weight, blood_sugar, doctor_visit, document, medication, symptoms

### 3. AI Assistant
- **Current**: Mock responses based on keywords
- **Backend**: 
  - Edge Function that calls Groq API
  - Prompt engineering for context-aware responses
  - Health record context injection

### 4. Voice Input
- **Current**: Simulated voice with random phrases
- **Backend**: 
  - Frontend: Web Speech API (free, built into browsers)
  - Backend: None needed - just send transcribed text to AI endpoint

### 5. Document Management
- **Current**: Mock documents in localStorage
- **Backend**: Supabase Storage + `documents` table
- **Tables**:
  - `documents` (id, user_id, title, file_url, file_format, thumbnail, ai_summary, created_at)
  - Use Supabase Storage for PDF files

### 6. Appointments & Reminders
- **Current**: Mock data in localStorage
- **Backend**: Supabase `appointments` and `reminders` tables
- **Tables**:
  - `appointments` (id, user_id, doctor_id, date, time, status, room)
  - `reminders` (id, user_id, title, description, due_date, completed, repeat)

### 7. Doctors Directory
- **Current**: Mock doctors in localStorage
- **Backend**: Supabase `doctors` table
- **Tables**:
  - `doctors` (id, name, specialty, phone, email, avatar_url, total_visits, visit_history)

## Data Flow Summary

1. **Auth**: Supabase Auth → Supabase JWT → Supabase tables
2. **Health Records**: Frontend sends record → Supabase Edge Function validates → Insert into `health_records`
3. **AI Assistant**: Frontend sends query + health context → Edge Function calls Groq API → Returns AI response
4. **Voice Input**: Browser's Web Speech API → Transcribed text → Sent to AI endpoint
5. **Documents**: Frontend uploads PDF → Supabase Storage → Record metadata in DB
6. **Appointments**: Frontend creates appointment → Supabase Edge Function validates → Insert into `appointments`

## Implementation Roadmap

### Phase 1: Setup Supabase Project
1. Create Supabase project at supabase.com
2. Set up database with required tables
3. Configure Auth (enable email/password, magic links)
4. Set up Storage buckets for document uploads
5. Create necessary RLS policies

### Phase 2: Authentication Integration
1. Replace localStorage auth with Supabase Auth client
2. Update AuthContext to use Supabase session management
3. Implement login/signup/logout flows

### Phase 3: Core Data Tables
1. Create health_records table with proper schema
2. Create doctors table with relationships
3. Create appointments table with foreign keys
4. Create reminders table with recurrence logic

### Phase 4: API Endpoints (Edge Functions)
1. Create auth validation function
2. Create health record CRUD functions
3. Create document management functions
4. Create AI assistant endpoint with Groq integration
5. Create appointment/reminder functions

### Phase 5: AI Assistant Implementation
1. Set up Groq API access (free tier)
2. Create prompt templates for different query types
3. Implement context injection from health records
4. Add voice input integration

### Phase 6: Document Processing
1. Implement PDF upload flow
2. Add Tesseract OCR for scanned documents
3. Create document metadata extraction
4. Implement AI summarization of documents

### Phase 7: Frontend Integration
1. Replace mock API calls with real Supabase calls
2. Update context providers to use real data
3. Add loading/error states
4. Implement real-time updates via Supabase Realtime

## Dependencies to Track
- Supabase project URL and anon key
- Groq API key (free tier)
- Tesseract OCR installation (for PDF processing)
- Web Speech API (built-in, no setup needed)

## Verification Plan
For each feature, verify:
1. Data appears correctly in Supabase dashboard
2. API calls work with proper authentication
3. Frontend displays real data (not mock)
4. Edge functions return expected responses
5. Voice input works in browser console