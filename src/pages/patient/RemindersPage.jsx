import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  Pill, 
  Stethoscope, 
  Activity, 
  Calendar,
  Sparkles 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

export const RemindersPage = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useHealth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medicine');
  const [date, setDate] = useState('2026-08-28');
  const [time, setTime] = useState('08:00 AM');
  const [repeat, setRepeat] = useState('Daily');
  const [notes, setNotes] = useState('');

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    await addReminder({
      title,
      category,
      date,
      time,
      repeat,
      notes
    });
    setIsAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Medicine': return { variant: 'purple', icon: Pill };
      case 'Doctor Visit': return { variant: 'info', icon: Stethoscope };
      case 'Measurement': return { variant: 'danger', icon: Activity };
      case 'Test': return { variant: 'warning', icon: Calendar };
      default: return { variant: 'default', icon: Bell };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Health Prompts & Adherence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Reminders & Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss a medication dose, blood pressure check, or upcoming diagnostic appointment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-600/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No reminders currently scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem) => {
              const badgeInfo = getCategoryBadge(rem.category);
              const Icon = badgeInfo.icon;
              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                    rem.completed
                      ? 'bg-slate-50 border-slate-200/60 opacity-60'
                      : 'bg-white border-slate-200/90 shadow-xs hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleReminder(rem.id)}
                      className="mt-0.5 sm:mt-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold truncate ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {rem.title}
                        </h4>
                        <Badge variant={badgeInfo.variant} size="sm">
                          <Icon className="w-3 h-3" />
                          <span>{rem.category}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rem.time}
                        </span>
                        <span>•</span>
                        <span>{rem.date}</span>
                        {rem.repeat && <span>({rem.repeat})</span>}
                      </div>

                      {rem.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{rem.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Health Reminder"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reminder Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning BP Check, Take Vitamin D"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Medicine">Medicine</option>
                <option value="Measurement">Measurement</option>
                <option value="Doctor Visit">Doctor Visit</option>
                <option value="Test">Test</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
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
                placeholder="08:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Instructions / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take 30 mins before breakfast"
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
