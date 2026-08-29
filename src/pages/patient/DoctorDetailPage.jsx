import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  Pill, 
  Phone, 
  Mail, 
  Plus, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { RecordCard } from '../../components/records/RecordCard';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const { doctors, records, documents, openAddRecord } = useHealth();

  const doctor = doctors.find(d => d.id === id) || doctors[0];

  // Records related to this doctor
  const doctorVisits = records.filter(r => 
    r.type === 'doctor_visit' && 
    (r.metadata?.doctorId === doctor.id || r.metadata?.doctorName?.includes(doctor.name.replace('Dr. ', '')))
  );

  // Documents associated with this doctor
  const associatedDocs = documents.filter(d => 
    d.doctor?.toLowerCase().includes(doctor.name.toLowerCase().replace('dr. ', ''))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/app/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Doctors</span>
      </Link>

      {/* Doctor Bio Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={doctor.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
            alt={doctor.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border border-slate-200 shrink-0 shadow-sm"
          />
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {doctor.fullName || doctor.name}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-cyan-700">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{doctor.hospital}</span>
            </p>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Reg. ID: {doctor.registrationNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openAddRecord('doctor_visit')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Visit Notes</span>
          </button>
        </div>
      </div>

      {/* Grid: Visit History on Left, Associated Documents & Prescriptions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visit History Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600" />
            <span>Consultation Timeline with {doctor.name}</span>
          </h3>

          <div className="space-y-4">
            {/* Hardcoded & Dynamic combined visit records */}
            {doctor.visitHistory && doctor.visitHistory.length > 0 ? (
              doctor.visitHistory.map((vis) => (
                <div key={vis.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-200">
                      {vis.date}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{vis.title}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">{vis.purpose}</h4>

                  {vis.findings && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Clinical Findings: </span>
                      {vis.findings}
                    </p>
                  )}

                  {vis.diagnosis && (
                    <p className="text-xs font-semibold text-cyan-900 bg-cyan-50/70 p-2 rounded-xl border border-cyan-100">
                      <span>Diagnosis: </span>{vis.diagnosis}
                    </p>
                  )}

                  {vis.prescriptions && vis.prescriptions.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700 block mb-1">Prescribed:</span>
                      <ul className="list-disc list-inside space-y-0.5 font-medium">
                        {vis.prescriptions.map((rx, idx) => (
                          <li key={idx}>{rx}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-xs text-slate-500">
                No past visit records found for this doctor.
              </div>
            )}
          </div>
        </div>

        {/* Associated Documents & Prescriptions (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Associated Documents</span>
          </h3>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
            {associatedDocs.length > 0 ? (
              associatedDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to="/app/records"
                  className="block p-3 rounded-2xl bg-slate-50 hover:bg-health-50 border border-slate-200/80 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-health-800 line-clamp-1">
                      {doc.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{doc.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{doc.summary}</p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No linked documents from this doctor.
              </p>
            )}

            <Link
              to="/app/records"
              className="block text-center py-2 text-xs font-bold text-health-700 hover:text-health-800 bg-health-50 rounded-xl"
            >
              Open Document Vault
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
