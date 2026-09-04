import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Plus,
  Calendar,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useHealth } from "../../context/HealthContext";
import { Modal } from "../../components/common/Modal";

const getDoctorAvatarUrl = (name) => {
  const seed = encodeURIComponent((name || "Doctor").trim() || "Doctor");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=bfdbfe,c7d2fe,ddd6fe,fee2e2,fecdd3&fontSize=42`;
};

export const DoctorsPage = () => {
  const { doctors, addDoctor, openAddRecord } = useHealth();
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [hospital, setHospital] = useState("");
  const [regNo, setRegNo] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    await addDoctor({
      name: name.startsWith("Dr.") ? name : `Dr. ${name}`,
      fullName: `${name}, MD`,
      specialization,
      hospital,
      registrationNumber:
        regNo || `KMC-${Math.floor(10000 + Math.random() * 90000)}`,
      phone: phone || "+91 80 1234 5678",
      firstVisit: new Date().toISOString().split("T")[0],
      lastVisit: new Date().toISOString().split("T")[0],
      nextAppointment: null,
    });
    setIsAddDoctorModalOpen(false);
    setName("");
    setHospital("");
    setRegNo("");
    setPhone("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Care Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Doctors & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of your healthcare providers, past visits, and upcoming
            consultations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddDoctorModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-cyan-600/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctor Cards Grid */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-100 shadow-xs">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Doctors in Your Care Team Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add your primary care physicians, consulting specialists, and clinics to track prescriptions, visits, and clinical briefs.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-cyan-600/20 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Doctor</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatarUrl || getDoctorAvatarUrl(doc.name)}
                    alt={doc.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getDoctorAvatarUrl(doc.name);
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-cyan-700 mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {doc.hospital}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100/80 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Visits</span>
                    <span className="font-bold text-slate-800">
                      {doc.totalVisits || (doc.visitHistory ? doc.visitHistory.length : 0)} visits
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Consultation</span>
                    <span className="font-semibold text-slate-700">
                      {doc.lastVisit || "Recent"}
                    </span>
                  </div>
                  {doc.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contact</span>
                      <span className="font-medium text-slate-700">
                        {doc.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/app/doctors/${doc.id}`}
                  className="flex-1 text-center py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <span>View History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => openAddRecord("doctor_visit")}
                  className="py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs rounded-xl transition-all"
                >
                  + Add Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        title="Add Doctor / Specialist"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Doctor's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Arvind Sharma"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. General Physician, Gastroenterologist"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Hospital / Clinic Affiliation
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. ABC Hospital, Indiranagar"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Medical Reg. Number
              </label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="e.g. KMC-48291"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 80 4123 4567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDoctorModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Doctor</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
