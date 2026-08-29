export const initialHealthRecords = [
  // August 2026 - Recent Events
  {
    id: "rec_20260828_01",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Morning resting check after 5 mins relaxation",
    date: "2026-08-28",
    time: "10:30 AM",
    metadata: {
      systolic: 128,
      diastolic: 82,
      pulse: 74,
      unit: "mmHg",
      category: "Normal / Controlled",
      notes: "Feeling calm, taken while seated"
    },
    createdAt: "2026-08-28T05:00:00Z"
  },
  {
    id: "rec_20260828_02",
    userId: "usr_rahul_101",
    type: "medicine",
    title: "Morning Dose Taken",
    description: "Pantoprazole 40mg",
    date: "2026-08-28",
    time: "09:00 AM",
    metadata: {
      medicineName: "Pantoprazole 40mg",
      dosage: "1 tablet",
      status: "Taken",
      notes: "Taken with lukewarm water 30 mins before breakfast"
    },
    createdAt: "2026-08-28T03:30:00Z"
  },
  {
    id: "rec_20260828_03",
    userId: "usr_rahul_101",
    type: "note",
    title: "Personal Health Observation",
    description: "Feeling slightly tired this morning after 6 hrs sleep",
    date: "2026-08-28",
    time: "08:15 AM",
    metadata: {
      tags: ["Sleep", "Energy", "Morning"],
      mood: "Mildly fatigued"
    },
    createdAt: "2026-08-28T02:45:00Z"
  },
  {
    id: "rec_20260827_01",
    userId: "usr_rahul_101",
    type: "note",
    title: "Symptom Note",
    description: "Headache improved significantly after hydration and resting in dark room.",
    date: "2026-08-27",
    time: "04:30 PM",
    metadata: {
      symptomRef: "Headache",
      status: "Resolved"
    },
    createdAt: "2026-08-27T11:00:00Z"
  },
  {
    id: "rec_20260826_01",
    userId: "usr_rahul_101",
    type: "symptom",
    title: "Mild Frontal Headache",
    description: "Dull ache around forehead and temples",
    date: "2026-08-26",
    time: "02:15 PM",
    metadata: {
      symptomName: "Frontal Headache",
      severity: 4, // 1-10
      location: "Forehead & Temples",
      triggers: "Late night screen time and missed hydration",
      notes: "Started around lunch time, did not take painkiller"
    },
    createdAt: "2026-08-26T08:45:00Z"
  },
  {
    id: "rec_20260825_01",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Evening check",
    date: "2026-08-25",
    time: "06:45 PM",
    metadata: {
      systolic: 138,
      diastolic: 88,
      pulse: 78,
      unit: "mmHg",
      category: "Pre-hypertension",
      notes: "Recorded after commuting back from office"
    },
    createdAt: "2026-08-25T13:15:00Z"
  },
  {
    id: "rec_20260823_01",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Morning check",
    date: "2026-08-23",
    time: "08:30 AM",
    metadata: {
      systolic: 150,
      diastolic: 95,
      pulse: 82,
      unit: "mmHg",
      category: "Stage 1 High",
      notes: "Slept poorly night before"
    },
    createdAt: "2026-08-23T03:00:00Z"
  },
  {
    id: "rec_20260822_01",
    userId: "usr_rahul_101",
    type: "weight",
    title: "Weight Measurement",
    description: "Weekly morning weigh-in",
    date: "2026-08-22",
    time: "07:30 AM",
    metadata: {
      value: 72.0,
      unit: "kg",
      bmi: 24.3,
      bmiCategory: "Normal weight",
      notes: "Fast weight before breakfast"
    },
    createdAt: "2026-08-22T02:00:00Z"
  },
  {
    id: "rec_20260820_01",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Morning check",
    date: "2026-08-20",
    time: "09:10 AM",
    metadata: {
      systolic: 148,
      diastolic: 94,
      pulse: 80,
      unit: "mmHg",
      category: "Stage 1 High"
    },
    createdAt: "2026-08-20T03:40:00Z"
  },
  {
    id: "rec_20260820_02",
    userId: "usr_rahul_101",
    type: "document",
    title: "Complete Blood Count (CBC) Report",
    description: "Uploaded lab test report from Metropolis Diagnostics",
    date: "2026-08-20",
    time: "05:30 PM",
    metadata: {
      documentId: "doc_cbc_20260820",
      documentType: "Reports",
      doctorName: "Dr. Sharma",
      facility: "Metropolis Labs, Bangalore",
      fileUrl: "/docs/cbc-report.pdf",
      extractedSummary: "Hemoglobin 13.8 g/dL (Normal), WBC 7,200/mcL (Normal), Platelets 2.4 Lakhs (Normal)"
    },
    createdAt: "2026-08-20T12:00:00Z"
  },
  {
    id: "rec_20260818_01",
    userId: "usr_rahul_101",
    type: "doctor_visit",
    title: "Doctor Consultation — Dr. Sharma",
    description: "Follow-up consultation for acidity and recurring epigastric discomfort",
    date: "2026-08-18",
    time: "11:30 AM",
    metadata: {
      doctorId: "doc_sharma_01",
      doctorName: "Dr. Sharma",
      specialization: "General Physician",
      hospital: "ABC Hospital, Indiranagar",
      findings: "Epigastric tenderness on deep palpation, vitals stable, throat clear",
      diagnosis: "Mild Gastritis / Acid Peptic Disorder",
      prescriptions: ["Pantoprazole 40mg (OD before breakfast for 14 days)"],
      testsRecommended: ["Ultrasound Whole Abdomen (if symptoms persist)"],
      followUpDate: "2026-09-10",
      notes: "Advised to reduce caffeine, avoid late night meals, and maintain 2hr gap before sleep"
    },
    createdAt: "2026-08-18T06:00:00Z"
  },
  {
    id: "rec_20260818_02",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Clinic recorded reading during visit",
    date: "2026-08-18",
    time: "11:15 AM",
    metadata: {
      systolic: 145,
      diastolic: 92,
      pulse: 76,
      unit: "mmHg",
      category: "Stage 1 High"
    },
    createdAt: "2026-08-18T05:45:00Z"
  },
  {
    id: "rec_20260815_01",
    userId: "usr_rahul_101",
    type: "blood_sugar",
    title: "Fasting Blood Sugar",
    description: "Home glucometer test",
    date: "2026-08-15",
    time: "07:45 AM",
    metadata: {
      value: 94,
      unit: "mg/dL",
      context: "Fasting (10 hrs)",
      category: "Normal (Under 100 mg/dL)"
    },
    createdAt: "2026-08-15T02:15:00Z"
  },
  {
    id: "rec_20260812_01",
    userId: "usr_rahul_101",
    type: "temperature",
    title: "Body Temperature Check",
    description: "Evening reading",
    date: "2026-08-12",
    time: "08:00 PM",
    metadata: {
      value: 98.4,
      unit: "°F",
      category: "Normal"
    },
    createdAt: "2026-08-12T14:30:00Z"
  },
  {
    id: "rec_20260808_01",
    userId: "usr_rahul_101",
    type: "weight",
    title: "Weight Measurement",
    description: "Morning weigh-in",
    date: "2026-08-08",
    time: "07:30 AM",
    metadata: {
      value: 72.4,
      unit: "kg",
      bmi: 24.5,
      bmiCategory: "Normal weight"
    },
    createdAt: "2026-08-08T02:00:00Z"
  },
  // July 2026 Events
  {
    id: "rec_20260725_01",
    userId: "usr_rahul_101",
    type: "blood_pressure",
    title: "Blood Pressure Reading",
    description: "Routine morning vitals",
    date: "2026-07-25",
    time: "08:45 AM",
    metadata: {
      systolic: 126,
      diastolic: 80,
      pulse: 72,
      unit: "mmHg",
      category: "Normal"
    },
    createdAt: "2026-07-25T03:15:00Z"
  },
  {
    id: "rec_20260720_01",
    userId: "usr_rahul_101",
    type: "document",
    title: "Lipid Profile & Liver Function Test",
    description: "Comprehensive health check report",
    date: "2026-07-20",
    time: "03:00 PM",
    metadata: {
      documentId: "doc_lipid_20260720",
      documentType: "Reports",
      doctorName: "Dr. Sharma",
      facility: "Apex Diagnostic Centre",
      extractedSummary: "Total Cholesterol 185 mg/dL (Desirable), HDL 48 mg/dL, Triglycerides 140 mg/dL, SGPT 32 U/L"
    },
    createdAt: "2026-07-20T09:30:00Z"
  },
  {
    id: "rec_20260705_01",
    userId: "usr_rahul_101",
    type: "doctor_visit",
    title: "Follow-up Consultation — Dr. Sharma",
    description: "Review of Vitamin D levels and seasonal allergy symptoms",
    date: "2026-07-05",
    time: "10:00 AM",
    metadata: {
      doctorId: "doc_sharma_01",
      doctorName: "Dr. Sharma",
      specialization: "General Physician",
      hospital: "ABC Hospital, Indiranagar",
      findings: "Nasal mucosa slightly congested. Mild vitamin D deficiency on report.",
      prescriptions: ["Vitamin D3 60,000 IU (1 capsule weekly for 8 weeks)", "Cetirizine 10mg SOS"],
      followUpDate: "2026-08-18"
    },
    createdAt: "2026-07-05T04:30:00Z"
  },
  {
    id: "rec_20260701_01",
    userId: "usr_rahul_101",
    type: "weight",
    title: "Weight Measurement",
    description: "Morning weigh-in",
    date: "2026-07-01",
    time: "07:30 AM",
    metadata: {
      value: 73.1,
      unit: "kg",
      bmi: 24.7
    },
    createdAt: "2026-07-01T02:00:00Z"
  },
  // June 2026 Events
  {
    id: "rec_20260620_01",
    userId: "usr_rahul_101",
    type: "document",
    title: "12-Lead Resting ECG Report",
    description: "Annual preventive cardiovascular screening",
    date: "2026-06-20",
    time: "11:00 AM",
    metadata: {
      documentId: "doc_ecg_20260620",
      documentType: "Scans",
      doctorName: "Dr. Priya Patel",
      facility: "Fortis Heart Institute",
      extractedSummary: "Normal Sinus Rhythm, Rate 72 bpm, Normal Axis, No ischemic ST-T changes"
    },
    createdAt: "2026-06-20T05:30:00Z"
  },
  {
    id: "rec_20260612_01",
    userId: "usr_rahul_101",
    type: "doctor_visit",
    title: "Initial Consultation — Dr. Sharma",
    description: "First visit for general health assessment and allergy check",
    date: "2026-06-12",
    time: "04:30 PM",
    metadata: {
      doctorId: "doc_sharma_01",
      doctorName: "Dr. Sharma",
      specialization: "General Physician",
      hospital: "ABC Hospital, Indiranagar",
      findings: "BP 132/84, Chest clear, normal S1/S2 heart sounds",
      diagnosis: "Seasonal Allergic Rhinitis",
      prescriptions: ["Cetirizine 10mg"],
      testsRecommended: ["Routine CBC", "Vitamin D3 & B12"]
    },
    createdAt: "2026-06-12T11:00:00Z"
  },
  {
    id: "rec_20260601_01",
    userId: "usr_rahul_101",
    type: "weight",
    title: "Weight Measurement",
    description: "Initial baseline weight",
    date: "2026-06-01",
    time: "07:30 AM",
    metadata: {
      value: 73.8,
      unit: "kg",
      bmi: 25.0
    },
    createdAt: "2026-06-01T02:00:00Z"
  }
];
