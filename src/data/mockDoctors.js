export const initialDoctors = [
  {
    id: "doc_sharma_01",
    name: "Dr. Sharma",
    fullName: "Dr. Arvind Sharma, MD",
    specialization: "General Physician / Internal Medicine",
    hospital: "ABC Hospital, Indiranagar, Bengaluru",
    registrationNumber: "KMC-48291-B",
    phone: "+91 80 4123 4567",
    email: "arvind.sharma@abchospital.in",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    firstVisit: "2026-06-12",
    lastVisit: "2026-08-18",
    nextAppointment: "2026-09-10",
    totalVisits: 3,
    notes: "Primary care physician. Familiar with gastrointestinal sensitivities and seasonal allergies.",
    visitHistory: [
      {
        id: "vis_1",
        date: "2026-06-12",
        title: "Initial Consultation",
        purpose: "Seasonal Allergic Rhinitis & General Health Checkup",
        findings: "Nasal mucosa congested, vitals stable (BP 132/84)",
        diagnosis: "Seasonal Allergic Rhinitis",
        prescriptions: ["Cetirizine 10mg"],
        testsOrdered: ["CBC", "Serum Vitamin D3"]
      },
      {
        id: "vis_2",
        date: "2026-07-05",
        title: "Follow-up & Report Review",
        purpose: "Lab report evaluation (CBC & Vitamin D)",
        findings: "Low Vitamin D3 (14 ng/mL), CBC normal",
        diagnosis: "Vitamin D Deficiency",
        prescriptions: ["Vitamin D3 60,000 IU Weekly"],
        testsOrdered: []
      },
      {
        id: "vis_3",
        date: "2026-08-18",
        title: "Follow-up Consultation",
        purpose: "Recurring epigastric burning / acidity",
        findings: "Epigastric tenderness on palpation, BP 145/92",
        diagnosis: "Mild Gastritis / Acid Peptic Disorder",
        prescriptions: ["Pantoprazole 40mg (OD before breakfast for 14d)"],
        testsOrdered: ["Ultrasound Whole Abdomen (if needed)"]
      }
    ]
  },
  {
    id: "doc_patel_02",
    name: "Dr. Priya Patel",
    fullName: "Dr. Priya Patel, DM (Cardiology)",
    specialization: "Cardiologist",
    hospital: "Fortis Heart Institute, Bannerghatta Road",
    registrationNumber: "KMC-61029-C",
    phone: "+91 80 6789 0123",
    email: "dr.patel@fortishealthcare.com",
    avatarUrl: "https://images.unsplash.com/photo-1594824813681-ef0db32e0388?w=150&auto=format&fit=crop&q=80",
    firstVisit: "2026-06-20",
    lastVisit: "2026-06-20",
    nextAppointment: null,
    totalVisits: 1,
    notes: "Consulted for annual cardiovascular check and ECG interpretation.",
    visitHistory: [
      {
        id: "vis_patel_1",
        date: "2026-06-20",
        title: "Annual Cardiovascular Screening",
        purpose: "Preventive Cardiac Checkup & 12-Lead ECG",
        findings: "Resting ECG normal sinus rhythm. Heart sounds normal.",
        diagnosis: "Healthy Cardiac Profile",
        prescriptions: [],
        testsOrdered: ["12-Lead ECG", "Lipid Profile"]
      }
    ]
  },
  {
    id: "doc_iyer_03",
    name: "Dr. Rajesh Iyer",
    fullName: "Dr. Rajesh Iyer, MD, DNB (Gastroenterology)",
    specialization: "Gastroenterologist",
    hospital: "Manipal Hospital, Old Airport Road",
    registrationNumber: "KMC-39182-G",
    phone: "+91 80 2502 4444",
    email: "rajesh.iyer@manipalhospitals.com",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    firstVisit: null,
    lastVisit: null,
    nextAppointment: "2026-09-15",
    totalVisits: 0,
    notes: "Referred for persistent abdominal discomfort review.",
    visitHistory: []
  }
];
