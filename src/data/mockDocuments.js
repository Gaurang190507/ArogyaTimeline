export const initialDocuments = [
  {
    id: "doc_cbc_20260820",
    title: "Complete Blood Count (CBC) Report",
    type: "Reports",
    date: "2026-08-20",
    doctor: "Dr. Sharma",
    hospital: "Metropolis Diagnostics, Indiranagar",
    fileSize: "1.4 MB",
    fileFormat: "PDF",
    fileUrl: "#",
    thumbnail: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&auto=format&fit=crop&q=80",
    summary: "Routine hemogram within normal parameters. Hemoglobin is stable at 13.8 g/dL, Platelets 2.4 Lakhs/mcL, and WBC count is 7,200 /mcL.",
    extractedData: {
      reportDate: "2026-08-20",
      patientName: "Rahul Sharma",
      hemoglobin: "13.8 g/dL (Normal 13.0 - 17.0)",
      wbcCount: "7,200 /mcL (Normal 4,000 - 11,000)",
      plateletCount: "2.40 Lakhs/mcL (Normal 1.5 - 4.5)",
      rbcCount: "4.8 million/mcL (Normal 4.5 - 5.9)",
      esr: "12 mm/hr (Normal < 15)",
      doctor: "Dr. Sharma",
      facility: "Metropolis Diagnostics"
    }
  },
  {
    id: "doc_lipid_20260720",
    title: "Lipid Profile & Liver Function Test (LFT)",
    type: "Reports",
    date: "2026-07-20",
    doctor: "Dr. Sharma",
    hospital: "Apex Diagnostic Centre",
    fileSize: "2.1 MB",
    fileFormat: "PDF",
    fileUrl: "#",
    thumbnail: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=300&auto=format&fit=crop&q=80",
    summary: "Lipid levels are healthy and within desirable ranges. Total Cholesterol is 185 mg/dL, HDL 48 mg/dL, Triglycerides 140 mg/dL. SGPT & SGOT are within normal limits.",
    extractedData: {
      reportDate: "2026-07-20",
      patientName: "Rahul Sharma",
      totalCholesterol: "185 mg/dL (< 200 Desirable)",
      hdlCholesterol: "48 mg/dL (> 40 Normal)",
      ldlCholesterol: "109 mg/dL (< 100 Optimal)",
      triglycerides: "140 mg/dL (< 150 Normal)",
      sgpt: "32 U/L (Normal < 45)",
      sgot: "28 U/L (Normal < 40)",
      bilirubin: "0.8 mg/dL (Normal < 1.2)",
      doctor: "Dr. Sharma",
      facility: "Apex Diagnostic Centre"
    }
  },
  {
    id: "doc_ecg_20260620",
    title: "12-Lead Resting ECG Scan",
    type: "Scans",
    date: "2026-06-20",
    doctor: "Dr. Priya Patel",
    hospital: "Fortis Heart Institute",
    fileSize: "3.5 MB",
    fileFormat: "JPG",
    fileUrl: "#",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80",
    summary: "Sinus rhythm at 72 bpm. Normal electrical axis. No ST segment elevation or depression. No active signs of ischemia.",
    extractedData: {
      reportDate: "2026-06-20",
      heartRate: "72 bpm",
      prInterval: "148 ms (Normal)",
      qrsDuration: "86 ms (Normal)",
      qtcInterval: "412 ms (Normal)",
      rhythm: "Normal Sinus Rhythm",
      conclusion: "Healthy Normal ECG Pattern",
      doctor: "Dr. Priya Patel",
      facility: "Fortis Heart Institute"
    }
  },
  {
    id: "doc_rx_20260818",
    title: "Prescription Slip — Gastritis Treatment",
    type: "Prescriptions",
    date: "2026-08-18",
    doctor: "Dr. Sharma",
    hospital: "ABC Hospital, Indiranagar",
    fileSize: "850 KB",
    fileFormat: "PDF",
    fileUrl: "#",
    thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80",
    summary: "Prescription for Pantoprazole 40mg once daily for 14 days with dietary modifications for acid reflux.",
    extractedData: {
      prescriptionDate: "2026-08-18",
      medicines: [
        "Tab. Pantoprazole 40mg — 1 OD before food x 14 days",
        "Syrup Gelusil MPS — 10ml SOS after meals"
      ],
      diagnosis: "Mild Gastritis / Acid Peptic Disorder",
      advice: "Avoid caffeine, avoid spicy/fried foods, keep 2 hour gap between dinner and sleep",
      nextVisit: "10-Sep-2026",
      doctor: "Dr. Sharma"
    }
  },
  {
    id: "doc_discharge_2018",
    title: "Appendectomy Discharge Summary",
    type: "Discharge Summaries",
    date: "2018-04-14",
    doctor: "Dr. K. N. Rao (General Surgery)",
    hospital: "Fortis Hospital, Bengaluru",
    fileSize: "4.2 MB",
    fileFormat: "PDF",
    fileUrl: "#",
    thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop&q=80",
    summary: "Laparoscopic appendectomy performed under general anesthesia. Uneventful post-operative recovery. Suture removal done on Day 8.",
    extractedData: {
      admissionDate: "2018-04-11",
      dischargeDate: "2018-04-14",
      procedure: "Laparoscopic Appendectomy",
      diagnosis: "Acute Appendicitis without Perforation",
      hospitalStay: "3 Days",
      dischargeCondition: "Hemodynamically stable, wound healthy",
      facility: "Fortis Hospital"
    }
  }
];
