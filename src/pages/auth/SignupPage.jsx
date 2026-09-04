import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart, ArrowRight, ArrowLeft, Check, Sparkles, User, Activity, Phone, Mic,
  ShieldAlert, CheckCircle2, Ruler, Scale, Droplets, Eye, Baby, Cigarette,
  Wine, Brain, Moon, Dumbbell, Utensils, Stethoscope, Shield, FileText,
  AlertTriangle, Pill, Users, HeartPulse, Thermometer, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { VoiceInput } from '../../components/common/VoiceInput';

const TOTAL_STEPS = 8;

const InputField = ({ label, value, onChange, placeholder, type = "text", className = "", ...rest }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
      {...rest}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-health-500"
    >
      {options.map(opt => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);

  // ─── Step 1: Personal Identity ───
  const [name, setName] = useState('Rahul Sharma');
  // Unique demo email computed once on mount so it doesn't regen on every render
  const [uniqueDemoEmail] = useState(() => `demo+${Date.now().toString().slice(-6)}@example.com`);
  const [email, setEmail] = useState(uniqueDemoEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dob, setDob] = useState('1994-06-15');
  const [sex, setSex] = useState('Male');
  const [genderIdentity, setGenderIdentity] = useState('Cisgender Male');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [occupation, setOccupation] = useState('Software Engineer');
  const [city, setCity] = useState('Bengaluru, Karnataka');
  const [preferredLang, setPreferredLang] = useState('English');

  // ─── Step 2: Body Measurements & Vitals ───
  const [height, setHeight] = useState('172');
  const [weight, setWeight] = useState('72');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [waistCircumference, setWaistCircumference] = useState('82');
  const [bodyFat, setBodyFat] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('72');
  const [baselineBP, setBaselineBP] = useState('124/80');
  const [visionLeft, setVisionLeft] = useState('6/6');
  const [visionRight, setVisionRight] = useState('6/9');
  const [wearsGlasses, setWearsGlasses] = useState('No');
  const [dentalStatus, setDentalStatus] = useState('Healthy – Last checkup Jan 2026');

  // ─── Step 3: Medical History ───
  const [conditions, setConditions] = useState('Mild Acid Reflux (GERD), Seasonal Rhinitis');
  const [pastIllnesses, setPastIllnesses] = useState('Typhoid (2021), Mild COVID-19 (2022)');
  const [surgeries, setSurgeries] = useState('Laparoscopic Appendectomy (2018)');
  const [hospitalizations, setHospitalizations] = useState('3 days for appendectomy at Fortis Hospital (2018)');
  const [injuries, setInjuries] = useState('Right ankle sprain (2020)');
  const [diabeticStatus, setDiabeticStatus] = useState('Non-diabetic');
  const [thyroidStatus, setThyroidStatus] = useState('Normal');
  const [cholesterolStatus, setCholesterolStatus] = useState('Borderline – LDL 128 mg/dL');

  // ─── Step 4: Allergies & Current Medications ───
  const [medAllergies, setMedAllergies] = useState('Penicillin (Skin rash and hives)');
  const [foodAllergies, setFoodAllergies] = useState('Crustacean Shellfish (Mild throat itching)');
  const [envAllergies, setEnvAllergies] = useState('Dust Mites (Sneezing, nasal congestion)');
  const [otherAllergies, setOtherAllergies] = useState('');
  const [medicines, setMedicines] = useState('Pantoprazole 40mg (OD before breakfast), Vitamin D3 60K (Weekly), Cetirizine 10mg (SOS)');
  const [supplements, setSupplements] = useState('Multivitamin daily, Omega-3 capsule');

  // ─── Step 5: Family History ───
  const [fatherHistory, setFatherHistory] = useState('Type 2 Diabetes, Essential Hypertension');
  const [motherHistory, setMotherHistory] = useState('Hypothyroidism');
  const [grandparentHistory, setGrandparentHistory] = useState('Paternal Grandfather: Coronary Artery Disease');
  const [siblingHistory, setSiblingHistory] = useState('None known');
  const [familyMentalHealth, setFamilyMentalHealth] = useState('No known conditions');
  const [familyCancer, setFamilyCancer] = useState('No known history');
  const [hereditary, setHereditary] = useState('');

  // ─── Step 6: Lifestyle & Habits ───
  const [diet, setDiet] = useState('Vegetarian');
  const [mealsPerDay, setMealsPerDay] = useState('3');
  const [waterIntake, setWaterIntake] = useState('2.5 - 3.0');
  const [caffeine, setCaffeine] = useState('2 cups tea/day');
  const [exercise, setExercise] = useState('Brisk walking / light jog 3 days/week');
  const [sleepHours, setSleepHours] = useState('6.5 - 7.5');
  const [sleepQuality, setSleepQuality] = useState('Moderate');
  const [smoking, setSmoking] = useState('Non-smoker');
  const [alcohol, setAlcohol] = useState('Occasional (Social)');
  const [stressLevel, setStressLevel] = useState('Moderate');
  const [screenTime, setScreenTime] = useState('8-10 hours/day (Work + Personal)');

  // ─── Step 7: Emergency, Insurance & Preferences ───
  const [emergencyName, setEmergencyName] = useState('Sunita Sharma');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43211');
  const [emergencyAltPhone, setEmergencyAltPhone] = useState('+91 98765 43212');
  const [insuranceProvider, setInsuranceProvider] = useState('Star Health Insurance');
  const [insurancePlan, setInsurancePlan] = useState('Family Health Optima – ₹10 Lakh');
  const [policyNumber, setPolicyNumber] = useState('SH-2026-XXXXX');
  const [organDonor, setOrganDonor] = useState('Yes');
  const [vaccinations, setVaccinations] = useState('COVID-19 (Covishield x3), Hepatitis B, Flu (2025)');

  // ─── Step 8: Personal Observations ───
  const [assistantNotes, setAssistantNotes] = useState(
    "I usually get headaches when I don't sleep properly. My stomach feels bloated after eating spicy or oily food in the evening. I tend to feel anxious before important meetings."
  );

  // Auto-calculated fields
  const calculateAge = (dobString) => {
    if (!dobString) return 32;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return isNaN(age) ? 32 : age;
  };
  const currentAge = calculateAge(dob);

  const calcBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return '—';
    const bmi = (w / (h * h)).toFixed(1);
    let cat = 'Normal weight';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
    else if (bmi >= 30) cat = 'Obese';
    return `${bmi} (${cat})`;
  };

  const handleComplete = async () => {
    try {
      await signup({
        name, email, password, phone, dateOfBirth: dob, age: currentAge, sex, genderIdentity,
        maritalStatus, occupation, city,
        height: parseFloat(height) || 172, weight: parseFloat(weight) || 72, bloodGroup,
        waistCircumference, bodyFat, restingHeartRate, baselineBP,
        visionLeft, visionRight, wearsGlasses, dentalStatus,
        medicalBackground: {
          existingConditions: conditions.split(',').map(s => s.trim()),
          pastIllnesses: pastIllnesses.split(',').map(s => s.trim()),
          previousSurgeries: surgeries.split(',').map(s => s.trim()),
          hospitalizations: hospitalizations.split(',').map(s => s.trim()),
          injuries: injuries.split(',').map(s => s.trim()),
          diabeticStatus, thyroidStatus, cholesterolStatus,
          allergies: [
            ...medAllergies.split(',').map(s => ({ allergen: s.trim(), category: 'Medication' })),
            ...foodAllergies.split(',').map(s => ({ allergen: s.trim(), category: 'Food' })),
            ...envAllergies.split(',').map(s => ({ allergen: s.trim(), category: 'Environmental' })),
          ].filter(a => a.allergen),
          familyHistory: [
            { relation: 'Father', condition: fatherHistory },
            { relation: 'Mother', condition: motherHistory },
            { relation: 'Grandparents', condition: grandparentHistory },
            { relation: 'Siblings', condition: siblingHistory },
          ],
          lifestyle: {
            diet, mealsPerDay, waterIntake, caffeine, exercise,
            sleepHours, sleepQuality, smoking, alcohol, stressLevel, screenTime
          }
        },
        currentMedications: medicines,
        supplements,
        vaccinations,
        insurance: { provider: insuranceProvider, plan: insurancePlan, policyNumber },
        organDonor,
        emergencyContact: {
          name: emergencyName, relationship: emergencyRelation,
          phone: emergencyPhone, alternatePhone: emergencyAltPhone
        },
        personalNotes: assistantNotes,
        preferredLanguage: preferredLang
      });
      // Hard navigation to ensure session is fresh
      window.location.href = '/app/home';
    } catch (err) {
      const msg = err.message || err.toString();
      if (msg.includes("confirm")) {
        alert(
          "✅ Account created! However, Supabase is asking you to confirm the email.\n\n" +
          "To skip this for the hackathon demo:\n" +
          "1. Go to Supabase Dashboard → Authentication → Providers → Email\n" +
          "2. Turn OFF 'Confirm email'\n" +
          "3. Try signing up again"
        );
      } else {
        alert("Signup failed: " + msg);
      }
    }
  };

  const stepLabels = [
    "Personal Identity",
    "Body & Vitals",
    "Medical History",
    "Allergies & Medicines",
    "Family History",
    "Lifestyle & Habits",
    "Emergency & Insurance",
    "Review & Confirm"
  ];


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-health-600/25">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">{t.brand.name}</span>
            <p className="text-[11px] text-slate-400 font-medium">Create Your Detailed Health Profile</p>
          </div>
        </div>
        <LanguageSelector compact={true} />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 pb-10">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-soft-lg border border-slate-200/80 p-6 sm:p-10">

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-health-700 uppercase tracking-wider">
                Step {step} of {TOTAL_STEPS}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {stepLabels[step - 1]}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-health-600 to-teal-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-between mt-2 px-1">
              {stepLabels.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i + 1)}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                    i + 1 < step ? 'bg-health-600 text-white' :
                    i + 1 === step ? 'bg-health-100 text-health-800 border-2 border-health-500 scale-110' :
                    'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                  title={label}
                >
                  {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ STEP 1: Personal Identity ═══ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-health-600" />
                <h3 className="text-xl font-bold text-slate-900">Personal Identity & Demographics</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">Tell us about yourself so we can personalize your health experience.</p>

              <InputField label="Full Name *" value={name} onChange={setName} placeholder="Rahul Sharma" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email Address *" value={email} onChange={setEmail} placeholder="demo@example.com" type="email" />
                <InputField label="Phone Number *" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password * <span className="text-slate-400 font-normal">(min 6 characters)</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    minLength={6}
                    required
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    minLength={6}
                    required
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth *</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Calculated Age</label>
                  <input type="text" disabled value={`${currentAge} years`}
                    className="w-full px-3.5 py-2.5 bg-health-50 border border-health-200 rounded-xl text-sm font-bold text-health-800" />
                </div>
                <SelectField label="Biological Sex *" value={sex} onChange={setSex}
                  options={["Male", "Female", "Intersex"]} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="Gender Identity" value={genderIdentity} onChange={setGenderIdentity}
                  options={["Cisgender Male", "Cisgender Female", "Transgender Male", "Transgender Female", "Non-binary", "Prefer not to say"]} />
                <SelectField label="Marital Status" value={maritalStatus} onChange={setMaritalStatus}
                  options={["Single", "Married", "Divorced", "Widowed", "Separated", "Prefer not to say"]} />
                <InputField label="Occupation" value={occupation} onChange={setOccupation} placeholder="Software Engineer" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="City / Location" value={city} onChange={setCity} placeholder="Bengaluru, Karnataka" />
                <SelectField label="Preferred Language" value={preferredLang} onChange={setPreferredLang}
                  options={[
                    { value: "English", label: "English" },
                    { value: "Hindi", label: "हिन्दी (Hindi)" },
                    { value: "Marathi", label: "मराठी (Marathi)" },
                    { value: "Bengali", label: "বাংলা (Bengali)" },
                    { value: "Tamil", label: "தமிழ் (Tamil)" },
                    { value: "Telugu", label: "తెలుగు (Telugu)" },
                    { value: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
                    { value: "Malayalam", label: "മലയാളം (Malayalam)" },
                    { value: "Gujarati", label: "ગુજરાતી (Gujarati)" },
                    { value: "Punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
                  ]} />
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Body Measurements & Vitals Baseline ═══ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Body Measurements & Vitals Baseline</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">These help us calibrate health ranges, chart trends, and calculate BMI.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField label="Height (cm) *" value={height} onChange={setHeight} placeholder="172" type="number" />
                <InputField label="Weight (kg) *" value={weight} onChange={setWeight} placeholder="72" type="number" />
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">BMI (Auto)</label>
                  <input type="text" disabled value={calcBMI()}
                    className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-800" />
                </div>
                <SelectField label="Blood Group *" value={bloodGroup} onChange={setBloodGroup}
                  options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Waist Circumference (cm)" value={waistCircumference} onChange={setWaistCircumference} placeholder="82" type="number" />
                <InputField label="Body Fat % (Optional)" value={bodyFat} onChange={setBodyFat} placeholder="e.g. 22%" />
                <InputField label="Resting Heart Rate (bpm)" value={restingHeartRate} onChange={setRestingHeartRate} placeholder="72" type="number" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Baseline Blood Pressure (Systolic/Diastolic)" value={baselineBP} onChange={setBaselineBP} placeholder="124/80" />
                <SelectField label="Do you wear corrective lenses?" value={wearsGlasses} onChange={setWearsGlasses}
                  options={["No", "Glasses", "Contact Lenses", "Both"]} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Vision — Left Eye" value={visionLeft} onChange={setVisionLeft} placeholder="6/6" />
                <InputField label="Vision — Right Eye" value={visionRight} onChange={setVisionRight} placeholder="6/9" />
                <InputField label="Dental Health Status" value={dentalStatus} onChange={setDentalStatus} placeholder="e.g. Healthy" />
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Medical History ═══ */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl font-bold text-slate-900">Medical History & Past Conditions</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">A thorough medical history helps the AI assistant provide more relevant health insights.</p>

              <InputField label="Existing / Chronic Conditions" value={conditions} onChange={setConditions}
                placeholder="e.g. Mild Acid Reflux (GERD), Seasonal Rhinitis" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Past Illnesses" value={pastIllnesses} onChange={setPastIllnesses}
                  placeholder="e.g. Typhoid (2021), COVID-19 (2022)" />
                <InputField label="Previous Surgeries" value={surgeries} onChange={setSurgeries}
                  placeholder="e.g. Appendectomy (2018)" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Hospitalizations (with duration)" value={hospitalizations} onChange={setHospitalizations}
                  placeholder="e.g. 3 days at Fortis Hospital (2018)" />
                <InputField label="Major Injuries / Fractures" value={injuries} onChange={setInjuries}
                  placeholder="e.g. Right ankle sprain (2020)" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="Diabetic Status" value={diabeticStatus} onChange={setDiabeticStatus}
                  options={["Non-diabetic", "Pre-diabetic", "Type 1 Diabetes", "Type 2 Diabetes", "Gestational Diabetes"]} />
                <SelectField label="Thyroid Status" value={thyroidStatus} onChange={setThyroidStatus}
                  options={["Normal", "Hypothyroidism", "Hyperthyroidism", "Under evaluation"]} />
                <InputField label="Cholesterol Level (if known)" value={cholesterolStatus} onChange={setCholesterolStatus}
                  placeholder="e.g. Borderline – LDL 128" />
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Allergies & Medications ═══ */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-900">Allergies & Current Medications</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">Accurate allergy data is critical for patient safety during prescriptions.</p>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Please list all known allergies even if mild — include the reaction type (rash, swelling, breathing difficulty etc.)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">💊 Medication Allergies</label>
                <input type="text" value={medAllergies} onChange={(e) => setMedAllergies(e.target.value)}
                  placeholder="e.g. Penicillin (Skin rash), Sulfa drugs (Hives)"
                  className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-rose-800 font-medium focus:ring-2 focus:ring-rose-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-1">🍤 Food Allergies</label>
                  <input type="text" value={foodAllergies} onChange={(e) => setFoodAllergies(e.target.value)}
                    placeholder="e.g. Shellfish, Peanuts, Gluten"
                    className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">🌿 Environmental Allergies</label>
                  <input type="text" value={envAllergies} onChange={(e) => setEnvAllergies(e.target.value)}
                    placeholder="e.g. Dust Mites, Pollen, Pet Dander"
                    className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-sm text-blue-800 font-medium" />
                </div>
              </div>

              <InputField label="Other Allergies (Latex, Cosmetics, etc.)" value={otherAllergies} onChange={setOtherAllergies}
                placeholder="e.g. Latex (skin irritation)" />

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-3">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-slate-800">Current Medications & Supplements</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prescribed Medicines (Name, Dosage, Frequency)</label>
                  <textarea value={medicines} onChange={(e) => setMedicines(e.target.value)} rows="2"
                    placeholder="e.g. Pantoprazole 40mg – 1 tab OD before breakfast"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed" />
                </div>

                <InputField label="Supplements & Vitamins" value={supplements} onChange={setSupplements}
                  placeholder="e.g. Multivitamin daily, Omega-3 capsule" className="mt-3" />
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Family History ═══ */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">Family Medical History</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">Hereditary conditions help in risk assessment for heart disease, diabetes, and cancer screenings.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="👨 Father's Medical History" value={fatherHistory} onChange={setFatherHistory}
                  placeholder="e.g. Type 2 Diabetes, Hypertension" />
                <InputField label="👩 Mother's Medical History" value={motherHistory} onChange={setMotherHistory}
                  placeholder="e.g. Hypothyroidism" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="👴👵 Grandparents' Medical History" value={grandparentHistory} onChange={setGrandparentHistory}
                  placeholder="e.g. Coronary Artery Disease" />
                <InputField label="👫 Siblings' Medical History" value={siblingHistory} onChange={setSiblingHistory}
                  placeholder="e.g. None known" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="🧠 Family Mental Health History" value={familyMentalHealth} onChange={setFamilyMentalHealth}
                  placeholder="e.g. Depression, Anxiety, Bipolar" />
                <InputField label="🎗️ Family Cancer History" value={familyCancer} onChange={setFamilyCancer}
                  placeholder="e.g. No known history" />
              </div>

              <InputField label="Known Hereditary / Genetic Conditions" value={hereditary} onChange={setHereditary}
                placeholder="e.g. Sickle Cell Trait, Thalassemia Minor" />
            </div>
          )}

          {/* ═══ STEP 6: Lifestyle & Habits ═══ */}
          {step === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Lifestyle, Diet & Daily Habits</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">Your daily routine directly impacts vitals, metabolic health, and disease risk.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="🥗 Diet Type" value={diet} onChange={setDiet}
                  options={["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian", "Pescatarian", "Jain", "Other"]} />
                <SelectField label="🍽️ Meals per Day" value={mealsPerDay} onChange={setMealsPerDay}
                  options={["1", "2", "3", "4", "5+"]} />
                <InputField label="💧 Water Intake (Litres/day)" value={waterIntake} onChange={setWaterIntake} placeholder="2.5 - 3.0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="☕ Caffeine Intake" value={caffeine} onChange={setCaffeine} placeholder="e.g. 2 cups tea/day" />
                <InputField label="🏃 Exercise Routine" value={exercise} onChange={setExercise}
                  placeholder="e.g. Brisk walking 3 days/week" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="😴 Sleep Hours / Night" value={sleepHours} onChange={setSleepHours} placeholder="6.5 - 7.5" />
                <SelectField label="💤 Sleep Quality" value={sleepQuality} onChange={setSleepQuality}
                  options={["Excellent", "Good", "Moderate", "Poor", "Insomnia"]} />
                <InputField label="📱 Screen Time / Day" value={screenTime} onChange={setScreenTime} placeholder="8-10 hours" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="🚬 Smoking Status" value={smoking} onChange={setSmoking}
                  options={["Non-smoker", "Ex-smoker", "Occasional", "Daily – Light", "Daily – Heavy"]} />
                <SelectField label="🍷 Alcohol Consumption" value={alcohol} onChange={setAlcohol}
                  options={["None / Teetotal", "Occasional (Social)", "Moderate (Weekends)", "Regular", "Heavy"]} />
                <SelectField label="🧘 Stress Level" value={stressLevel} onChange={setStressLevel}
                  options={["Low", "Moderate", "High", "Very High / Chronic"]} />
              </div>
            </div>
          )}

          {/* ═══ STEP 7: Emergency, Insurance & Vaccinations ═══ */}
          {step === 7 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-cyan-600" />
                <h3 className="text-xl font-bold text-slate-900">Emergency Contact, Insurance & Vaccinations</h3>
              </div>
              <p className="text-xs text-slate-500 -mt-3">Essential safety information for hospital admissions and emergencies.</p>

              {/* Emergency Contact */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">🚨 Emergency Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Contact Person Name *" value={emergencyName} onChange={setEmergencyName} placeholder="Sunita Sharma" />
                  <InputField label="Relationship *" value={emergencyRelation} onChange={setEmergencyRelation} placeholder="Spouse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Phone Number *" value={emergencyPhone} onChange={setEmergencyPhone} placeholder="+91 98765 43211" />
                  <InputField label="Alternate Phone" value={emergencyAltPhone} onChange={setEmergencyAltPhone} placeholder="+91 98765 43212" />
                </div>
              </div>

              {/* Insurance */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">🏥 Health Insurance Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Insurance Provider" value={insuranceProvider} onChange={setInsuranceProvider} placeholder="Star Health Insurance" />
                  <InputField label="Plan / Cover" value={insurancePlan} onChange={setInsurancePlan} placeholder="Family Health Optima – ₹10 Lakh" />
                </div>
                <InputField label="Policy Number" value={policyNumber} onChange={setPolicyNumber} placeholder="SH-2026-XXXXX" />
              </div>

              {/* Vaccinations & Organ Donor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">💉 Vaccination History</label>
                  <textarea value={vaccinations} onChange={(e) => setVaccinations(e.target.value)} rows="2"
                    placeholder="e.g. COVID-19 (Covishield x3), Hepatitis B, Flu (2025)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed" />
                </div>
                <SelectField label="🫀 Registered Organ Donor?" value={organDonor} onChange={setOrganDonor}
                  options={["Yes", "No", "Considering"]} />
              </div>
            </div>
          )}

          {/* ═══ STEP 8: Personal Notes + Review ═══ */}
          {step === 8 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-health-600" />
                <h3 className="text-xl font-bold text-slate-900">Personal Notes & Profile Review</h3>
              </div>

              {/* Personal Observations */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-slate-800">What would you like your health assistant to know?</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>These are your personal observations, not formal medical diagnoses.</span>
                </div>
                <textarea value={assistantNotes} onChange={(e) => setAssistantNotes(e.target.value)} rows="3"
                  placeholder="e.g., I usually get headaches when I don't sleep properly..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium leading-relaxed focus:ring-2 focus:ring-health-500 focus:bg-white" />
                <VoiceInput
                  onResult={(speech) => setAssistantNotes(speech)}
                />
              </div>

              {/* Review Summary Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">📋 Your Complete Health Profile</h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                  <div><span className="font-semibold text-slate-500">Name:</span> <span className="text-slate-800">{name}</span></div>
                  <div><span className="font-semibold text-slate-500">Age / Sex:</span> <span className="text-slate-800">{currentAge} yrs • {sex}</span></div>
                  <div><span className="font-semibold text-slate-500">Blood:</span> <span className="font-bold text-rose-700">{bloodGroup}</span></div>
                  <div><span className="font-semibold text-slate-500">Height:</span> <span className="text-slate-800">{height} cm</span></div>
                  <div><span className="font-semibold text-slate-500">Weight:</span> <span className="text-slate-800">{weight} kg</span></div>
                  <div><span className="font-semibold text-slate-500">BMI:</span> <span className="text-slate-800">{calcBMI()}</span></div>
                  <div><span className="font-semibold text-slate-500">HR:</span> <span className="text-slate-800">{restingHeartRate} bpm</span></div>
                  <div><span className="font-semibold text-slate-500">BP:</span> <span className="text-slate-800">{baselineBP} mmHg</span></div>
                  <div><span className="font-semibold text-slate-500">Status:</span> <span className="text-slate-800">{maritalStatus}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Conditions:</span>
                  <p className="text-slate-700 mt-0.5">{conditions || 'None reported'}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Allergies:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[medAllergies, foodAllergies, envAllergies].filter(Boolean).map((a, i) => (
                      <span key={i} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium border border-rose-200 text-[11px]">{a}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Medications:</span>
                  <p className="text-slate-700 mt-0.5">{medicines || 'None'}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Family:</span>
                  <p className="text-slate-700 mt-0.5">Father: {fatherHistory} • Mother: {motherHistory}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Lifestyle:</span>
                  <p className="text-slate-700 mt-0.5">{diet} diet • {exercise} • Sleep: {sleepHours}h ({sleepQuality}) • {smoking} • Alcohol: {alcohol}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Emergency:</span>
                  <p className="text-slate-700 mt-0.5">{emergencyName} ({emergencyRelation}) — {emergencyPhone}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">Insurance:</span>
                  <p className="text-slate-700 mt-0.5">{insuranceProvider} — {insurancePlan}</p>
                </div>

                {assistantNotes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-500">Personal Notes:</span>
                    <p className="text-slate-600 italic mt-0.5">"{assistantNotes}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ Navigation Controls ═══ */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <Link to="/login" className="text-xs font-semibold text-slate-500 hover:underline">
                Already have an account? Login
              </Link>
            )}

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-health-600 hover:bg-health-700 rounded-2xl shadow-md shadow-health-600/20 hover:shadow-lg transition-all ml-auto">
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleComplete}
                className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-health-600 hover:bg-health-700 rounded-2xl shadow-lg shadow-health-600/30 hover:shadow-xl transition-all ml-auto">
                <Check className="w-4 h-4" />
                <span>Complete Profile & Open Timeline</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
