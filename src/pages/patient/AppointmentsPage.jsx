import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MapPin 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { AnupanaCard } from '../../components/common/AnupanaCard';

export const AppointmentsPage = () => {
  const { appointments, addAppointment, cancelAppointment, records } = useHealth();

  // Find doctor_visit records that correspond to past appointments
  const doctorVisitRecords = records.filter(r => r.type === 'doctor_visit' || r.metadata?.doctorName);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAptToCancel, setSelectedAptToCancel] = useState(null);

  // Form states
  const [doctorName, setDoctorName] = useState('Dr. Sharma');
  const [hospital, setHospital] = useState('ABC Hospital, Indiranagar');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30 AM');
  const [purpose, setPurpose] = useState('Follow-up consultation');

  const upcomingAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const pastAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    await addAppointment({
      doctorName,
      doctorSpecialty: "Specialist Consultation",
      hospital,
      date,
      time,
      purpose,
      status: "Confirmed",
      room: "OPD Room 204"
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Consultation Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your scheduled clinic visits, diagnostic tests, and follow-ups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-cyan-600/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Upcoming ({upcomingAppointments.length})
        </h3>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-xs text-slate-500 shadow-soft">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-200">
                      {apt.status || "Upcoming"}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                      {apt.date} • {apt.time}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h4 className="text-base font-bold text-slate-900">{apt.doctorName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.hospital} ({apt.room || 'OPD'})</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-3">
                    <span className="font-semibold text-slate-700">Purpose: </span>
                    {apt.purpose}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAptToCancel(apt.id)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Reschedule request logged. Clinic will confirm availability.")}
                    className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Past Consultations ({pastAppointments.length})
        </h3>

        <div className="space-y-3">
          {pastAppointments.map((apt) => {
            // Match this appointment to a doctor_visit record (by doctor name + date)
            const matchedRecord = doctorVisitRecords.find(
              r => (r.metadata?.doctorName === apt.doctorName || r.title?.includes(apt.doctorName)) &&
                   (r.date === apt.date || r.metadata?.diagnosis)
            );
            return (
              <div key={apt.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{apt.doctorName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{apt.hospital} • {apt.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-600 italic">{apt.purpose}</p>
                  {matchedRecord && apt.status !== 'Cancelled' && (
                    <AnupanaCard record={matchedRecord} compact={true} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Clinic Appointment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Sharma"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital / Clinic</label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. ABC Hospital, Indiranagar"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose / Chief Symptoms</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow-up on blood pressure and gastritis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!selectedAptToCancel}
        onClose={() => setSelectedAptToCancel(null)}
        onConfirm={() => {
          if (selectedAptToCancel) cancelAppointment(selectedAptToCancel);
        }}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this scheduled consultation?"
        confirmLabel="Cancel Appointment"
        isDanger={true}
      />
    </div>
  );
};
