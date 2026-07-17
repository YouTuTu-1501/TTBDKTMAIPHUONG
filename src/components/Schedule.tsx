import React, { useState } from 'react';
import { Calendar, Edit2, Check, Plus, Trash2, X } from 'lucide-react';
import { UserRole } from '../App';

type Period = 'morning' | 'afternoon' | 'evening';

interface DaySchedule {
  day: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
}

const initialScheduleData: DaySchedule[] = [
  {
    day: 'Thứ 2',
    morning: ['07h00: Lớp 6', '09h00: Lớp 12'],
    afternoon: ['15h00: Lớp 8'],
    evening: []
  },
  {
    day: 'Thứ 3',
    morning: ['07h00: Lớp 10'],
    afternoon: ['14h30: Lớp 11'],
    evening: []
  },
  {
    day: 'Thứ 4',
    morning: ['07h00: Lớp 6', '09h00: Lớp 12'],
    afternoon: ['15h00: Lớp 8'],
    evening: []
  },
  {
    day: 'Thứ 5',
    morning: ['07h00: Lớp 10'],
    afternoon: ['14h30: Lớp 11'],
    evening: []
  },
  {
    day: 'Thứ 6',
    morning: ['07h00: Lớp 6', '09h00: Lớp 12'],
    afternoon: [],
    evening: ['19h30: Lớp 8']
  },
  {
    day: 'Thứ 7',
    morning: ['07h00: Lớp 10', '09h00: Lớp 12'],
    afternoon: ['14h30: Lớp 11'],
    evening: []
  },
  {
    day: 'Chủ nhật',
    morning: [],
    afternoon: [],
    evening: []
  }
];

const getSessionClass = (session: string) => {
  if (session.includes('Lớp 6')) return 'bg-[#dcfce7] text-[#166534] font-medium';
  if (session.includes('Lớp 12')) return 'bg-[#f3e8ff] text-[#6b21a8] font-medium';
  if (session.includes('Lớp 10')) return 'bg-[#fef9c3] text-[#854d0e] font-medium';
  if (session.includes('Lớp 8')) return 'bg-[#ffedd5] text-[#dc2626] font-bold';
  if (session.includes('Lớp 11')) return 'bg-[#e0f2fe] text-[#075985] font-bold';
  return 'bg-slate-100 text-slate-700';
};

export function Schedule({ userRole }: { userRole: UserRole }) {
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>(initialScheduleData);
  const [newSessionInput, setNewSessionInput] = useState<{ dayIndex: number; period: Period; value: string } | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'teacher';

  const handleAddSession = (dayIndex: number, period: Period) => {
    if (!newSessionInput || !newSessionInput.value.trim()) {
      setNewSessionInput(null);
      return;
    }
    const updated = [...scheduleData];
    updated[dayIndex][period].push(newSessionInput.value.trim());
    setScheduleData(updated);
    setNewSessionInput(null);
  };

  const handleRemoveSession = (dayIndex: number, period: Period, sessionIndex: number) => {
    const updated = [...scheduleData];
    updated[dayIndex][period].splice(sessionIndex, 1);
    setScheduleData(updated);
  };

  const renderCellContent = (dayIndex: number, period: Period) => {
    const sessions = scheduleData[dayIndex][period];
    
    return (
      <div className="flex flex-col h-full">
        {sessions.map((session, i) => (
          <div key={i} className={`p-4 text-center h-full flex items-center justify-center relative group/session ${getSessionClass(session)} ${i > 0 ? 'border-t border-slate-200' : ''}`}>
            {session}
            {isEditing && (
              <button 
                onClick={() => handleRemoveSession(dayIndex, period, i)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover/session:opacity-100 transition-opacity hover:bg-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {sessions.length === 0 && !isEditing && (
          <div className="p-4 text-center text-slate-300 h-full flex items-center justify-center font-medium min-h-[4rem]">-</div>
        )}
        
        {isEditing && (
          <div className={`p-2 border-t border-slate-200 ${sessions.length === 0 ? 'border-t-0' : ''}`}>
            {newSessionInput?.dayIndex === dayIndex && newSessionInput?.period === period ? (
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="VD: 07h00: Lớp 6"
                  className="w-full text-xs px-2 py-1.5 border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newSessionInput.value}
                  onChange={(e) => setNewSessionInput({ ...newSessionInput, value: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSession(dayIndex, period);
                    if (e.key === 'Escape') setNewSessionInput(null);
                  }}
                />
                <button 
                  onClick={() => handleAddSession(dayIndex, period)}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setNewSessionInput(null)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setNewSessionInput({ dayIndex, period, value: '' })}
                className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm lớp
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 ">
      <div className="bg-white p-6 rounded-2xl border border-indigo-100/60 shadow-[0_8px_30px_rgb(79,70,229,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 ring-1 ring-indigo-100/50">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thời khoá biểu</h2>
            <p className="text-slate-500 text-sm mt-1">Lịch học thêm môn Toán - Thầy Phương</p>
          </div>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm ring-1 ${
              isEditing 
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' 
                : 'bg-white text-indigo-600 ring-indigo-100 hover:bg-indigo-50 hover:ring-indigo-200'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                Hoàn tất
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 w-[15%]">Thứ</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-[28%]">Sáng</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-[28%]">Chiều</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-[28%]">Tối</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {scheduleData.map((dayData, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                  <td className={`p-4 font-bold text-center border-r border-b border-slate-200 text-[#1e3a5f] ${dayData.day === 'Chủ nhật' ? 'bg-slate-100/50' : 'bg-slate-50/50'}`}>
                    {dayData.day}
                  </td>
                  <td className="p-0 border-r border-b border-slate-200 h-full align-top">
                    {renderCellContent(index, 'morning')}
                  </td>
                  <td className="p-0 border-r border-b border-slate-200 h-full align-top">
                    {renderCellContent(index, 'afternoon')}
                  </td>
                  <td className="p-0 border-b border-slate-200 h-full align-top">
                    {renderCellContent(index, 'evening')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
