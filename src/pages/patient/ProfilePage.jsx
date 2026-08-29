import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  Activity, 
  Heart, 
  Pill, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Sparkles, 
  Mic, 
  Check 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { VoiceInput } from '../../components/common/VoiceInput';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useHealth();

  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [height, setHeight] = useState(user?.height || 172);
  const [weight, setWeight] = useState(user?.weight || 72);
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'B+');
  const [personalNotes, setPersonalNotes] = useState(user?.personalNotes || "I usually get headaches when I don't sleep properly.");

  const handleSave = async () => {
    await updateUserProfile({
      name,
      phone,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bloodGroup,
      personalNotes
    });
    setIsEditing(false);
    showToast("Profile details updated successfully");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-health-600/25 shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{user?.email || 'demo@example.com'} • {phone}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
              <span className="bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-lg border border-rose-200">
                Blood: {bloodGroup}
              </span>
              <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg">
                32 yrs (Male)
              </span>
              <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg">
                {height} cm • {weight} kg
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-sm transition-all ${
            isEditing 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-health-50 hover:bg-health-100 text-health-800 border border-health-200'
          }`}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
        </button>
      </div>

      {/* "Things I want my health assistant to know" */}
      <div className="bg-gradient-to-br from-health-50/90 via-teal-50/50 to-white rounded-3xl p-6 sm:p-8 border border-health-200 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-health-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Things I want my health assistant to know
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Personal habits, sleep patterns, dietary triggers, or observations you want your AI health memory to remember.
        </p>

        <textarea
          value={personalNotes}
          disabled={!isEditing}
          onChange={(e) => setPersonalNotes(e.target.value)}
          rows="3"
          className={`w-full px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
            isEditing 
              ? 'bg-white border border-slate-300 ring-2 ring-health-200' 
              : 'bg-white/80 border border-health-100 text-slate-800'
          }`}
        />

        {isEditing && (
          <VoiceInput
            onResult={(speech) => setPersonalNotes((prev) => `${prev} ${speech}`)}
          />
        )}
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Medical Background */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-health-600" />
            <span>Medical Background</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Existing Diagnoses:</span>
              <p className="text-slate-600">Mild Acid Reflux (GERD), Seasonal Rhinitis</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Past Illnesses:</span>
              <p className="text-slate-600">Typhoid (2021)</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Previous Surgeries:</span>
              <p className="text-slate-600">Appendectomy (2018 at Fortis Hospital)</p>
            </div>
          </div>
        </div>

        {/* 2. Documented Allergies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Known Allergies</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
              <span className="font-bold block">Penicillin</span>
              <span className="text-[11px] text-rose-700">Skin hives and rash (Moderate reaction)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
              <span className="font-bold block">Dust Mites</span>
              <span className="text-[11px] text-amber-700">Nasal congestion and sneezing (Mild)</span>
            </div>
          </div>
        </div>

        {/* 3. Active Medications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-600" />
            <span>Current Medications (3 Active)</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
              <span className="font-bold block">Pantoprazole 40mg</span>
              <span className="text-[11px] text-purple-700">1 tablet OD before breakfast • Prescribed by Dr. Sharma</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
              <span className="font-bold block">Vitamin D3 60,000 IU</span>
              <span className="text-[11px] text-purple-700">1 capsule weekly with milk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
              <span className="font-bold block">Cetirizine 10mg</span>
              <span className="text-[11px] text-purple-700">As needed (SOS) for seasonal allergy</span>
            </div>
          </div>
        </div>

        {/* 4. Emergency Contact */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-cyan-600" />
            <span>Emergency Contact</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Primary Contact Name:</span>
              <p className="text-slate-900 font-bold text-sm">Sunita Sharma (Spouse)</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Phone Number:</span>
              <p className="text-cyan-800 font-mono font-bold">+91 98765 43211</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
