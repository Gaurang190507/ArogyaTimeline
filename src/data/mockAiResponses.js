export const mockAiConversations = [
  {
    id: "conv_bp_trend",
    userQuery: "How has my blood pressure changed this month?",
    aiResponse: `You have recorded four blood pressure readings this month:

• **145/92 mmHg** on August 18 (at clinic consultation)
• **148/94 mmHg** on August 20 (morning reading)
• **150/95 mmHg** on August 23 (morning reading)
• **128/82 mmHg** on August 28 (latest morning check)

Your latest recorded reading (128/82) is notably lower and back in the normal range compared to the elevated values recorded earlier between Aug 18–23.`,
    disclaimer: "These records alone do not establish a clinical diagnosis. Discuss persistent or concerning readings with a qualified healthcare professional.",
    followUp: {
      question: "Would you like me to prepare a 1-page BP log summary for your upcoming consultation with Dr. Sharma on September 10?",
      options: [
        "Yes, prepare BP summary",
        "Show blood pressure chart",
        "Add new reading",
        "Not right now"
      ]
    }
  },
  {
    id: "conv_sugar_followup",
    userQuery: "Why has my blood sugar been fluctuating recently?",
    aiResponse: `I can compare your recorded glucose values, but I need one detail first to give you accurate insights.

Were your recent readings taken fasting in the morning, after meals (post-prandial), or at different times throughout the day?`,
    disclaimer: "Blood sugar levels fluctuate naturally based on meal composition, physical activity, sleep quality, and timing of meals.",
    followUp: {
      question: "Select the timing context for your readings:",
      options: [
        "Before meals (Fasting)",
        "After meals (Post-prandial)",
        "Different times / Random",
        "I'm not sure"
      ]
    }
  },
  {
    id: "conv_prepare_doctor",
    userQuery: "Prepare me for my next doctor visit.",
    aiResponse: `Here is your **Pre-Visit Briefing** for your upcoming appointment with **Dr. Sharma** on **September 10, 2026**:

### 1. Key Timeline Since Last Visit (Aug 18)
• **Prescription Adherence**: You have taken *Pantoprazole 40mg* daily for 10 days.
• **Symptoms Recorded**: 1 episode of mild frontal headache on Aug 26 (severity 4/10), resolved on Aug 27.
• **Blood Pressure Trend**: Improved from 145/92 on Aug 18 to 128/82 on Aug 28.
• **Latest Lab Report**: CBC from Aug 20 (Hemoglobin 13.8 g/dL, Platelets 2.4 Lakhs).

### 2. Suggested Questions to Ask Dr. Sharma
1. *"My morning BP has improved to 128/82 — should I continue daily monitoring at the same time?"*
2. *"My acid reflux symptoms have lessened with Pantoprazole — should I taper off after the 14-day course?"*
3. *"Do I still need the abdominal ultrasound test that was tentatively planned?"*`,
    disclaimer: "This preparation guide is generated from your personal health timeline to help you communicate effectively with your doctor.",
    followUp: {
      question: "What would you like to do next?",
      options: [
        "Print Pre-Visit Summary",
        "Add a note to my doctor list",
        "Review prescribed medicines"
      ]
    }
  },
  {
    id: "conv_summarize_month",
    userQuery: "What happened with my health this month?",
    aiResponse: `Here is a summary of your health memory for **August 2026**:

• **Doctor Consultations**: 1 visit on Aug 18 with Dr. Sharma regarding acid reflux.
• **Prescriptions Started**: Pantoprazole 40mg OD for gastritis.
• **Documents Uploaded**: 1 Complete Blood Count (CBC) report from Metropolis Labs.
• **Vitals Recorded**: 4 Blood Pressure readings (range 128/82 to 150/95), 2 Weight measurements (72.0–72.4 kg), 1 Fasting Blood Sugar (94 mg/dL), 1 Temperature check (98.4°F).
• **Symptoms**: 1 mild frontal headache episode (Aug 26–27, resolved).`,
    disclaimer: "AI-generated summaries are informational and should be verified with a qualified healthcare professional.",
    followUp: {
      question: "Explore more details:",
      options: [
        "View August Calendar",
        "View Health Trends",
        "Export Health Story"
      ]
    }
  },
  {
    id: "conv_medicines",
    userQuery: "What medicines have I recorded?",
    aiResponse: `You currently have **3 active medications** in your health memory:

1. **Pantoprazole 40mg**
   • *Dosage*: 1 tablet once daily before breakfast
   • *Purpose*: Acid Reflux / Gastritis
   • *Prescribed by*: Dr. Sharma (Started 18 Aug 2026)

2. **Vitamin D3 60,000 IU**
   • *Dosage*: 1 capsule weekly with milk
   • *Purpose*: Vitamin D supplementation
   • *Prescribed by*: Dr. Sharma (Started 05 Jul 2026)

3. **Cetirizine 10mg**
   • *Dosage*: 1 tablet as needed (SOS)
   • *Purpose*: Seasonal Allergic Rhinitis
   • *Prescribed by*: Dr. Sharma (Started 12 Jun 2026)`,
    disclaimer: "Always consult your physician or pharmacist before altering dosages or starting any new medication."
  }
];

export const defaultAiGreetings = [
  "Namaste Rahul! I'm your Health Memory Assistant. I have indexed your vitals, doctor visits, lab reports, and medication logs.",
  "You can ask me questions about your past readings, prepare for your next doctor appointment, or summarize recent events."
];
