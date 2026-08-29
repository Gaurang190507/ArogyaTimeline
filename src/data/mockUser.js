export const mockUser = {
  id: "usr_rahul_101",
  name: "Rahul Sharma",
  email: "demo@example.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1994-06-15",
  age: 32,
  sex: "Male",
  genderIdentity: "Cisgender Male",
  height: 172, // cm
  weight: 72, // kg
  bmi: 24.3,
  bmiCategory: "Normal weight",
  bloodGroup: "B+",
  baselineBP: "124/80 mmHg",
  restingHeartRate: 72, // bpm
  diabeticStatus: "Non-diabetic (Fasting 92 mg/dL)",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  emergencyContact: {
    name: "Sunita Sharma",
    relationship: "Spouse",
    phone: "+91 98765 43211",
    alternatePhone: "+91 98765 43212"
  },
  medicalBackground: {
    existingConditions: ["Mild Acid Reflux (GERD)", "Seasonal Rhinitis"],
    pastIllnesses: ["Typhoid (2021)", "Mild COVID-19 (2022)"],
    previousSurgeries: ["Laparoscopic Appendectomy (2018)"],
    hospitalizations: ["3 days for appendectomy at Fortis Hospital (2018)"],
    allergies: [
      { allergen: "Penicillin", category: "Medication", reaction: "Skin rash and hives", severity: "Moderate" },
      { allergen: "Dust Mites", category: "Environmental", reaction: "Sneezing and nasal congestion", severity: "Mild" },
      { allergen: "Crustacean Shellfish", category: "Food", reaction: "Mild throat itching", severity: "Mild" }
    ],
    familyHistory: [
      { relation: "Father", condition: "Type 2 Diabetes, Essential Hypertension" },
      { relation: "Mother", condition: "Hypothyroidism" },
      { relation: "Paternal Grandfather", condition: "Coronary Artery Disease" }
    ],
    lifestyle: {
      diet: "Vegetarian",
      waterIntake: "2.5 - 3.0 Liters/day",
      sleepDuration: "6.5 - 7.5 hours (Moderate quality)",
      exercise: "Brisk walking / light jog 3 days/week",
      smoking: "Non-smoker",
      alcohol: "Occasional (Social)",
      stressLevel: "Moderate (Work-related)",
      organDonor: "Yes (Registered)"
    }
  },
  currentMedications: [
    {
      id: "med_1",
      name: "Pantoprazole 40mg",
      dosage: "1 tablet",
      frequency: "Once daily before breakfast",
      purpose: "Acid Reflux / Gastritis",
      prescribedBy: "Dr. Sharma",
      startDate: "2026-08-18",
      active: true
    },
    {
      id: "med_2",
      name: "Cetirizine 10mg",
      dosage: "1 tablet",
      frequency: "As needed (SOS) for allergies",
      purpose: "Allergic Rhinitis",
      prescribedBy: "Dr. Sharma",
      startDate: "2026-06-12",
      active: true
    },
    {
      id: "med_3",
      name: "Vitamin D3 60K",
      dosage: "1 capsule",
      frequency: "Once weekly with milk",
      purpose: "Vitamin D supplement",
      prescribedBy: "Dr. Sharma",
      startDate: "2026-07-05",
      active: true
    }
  ],
  personalNotes: "I usually get headaches when I don't sleep properly. My stomach feels bloated after eating spicy or oily food in the evening.",
  preferences: {
    language: "en",
    theme: "light",
    voiceEnabled: true,
    speechRate: "Normal",
    notifications: {
      medicineReminders: true,
      appointmentAlerts: true,
      measurementPrompts: true,
      emailDigest: false
    }
  },
  createdAt: "2026-01-10T10:00:00Z"
};
