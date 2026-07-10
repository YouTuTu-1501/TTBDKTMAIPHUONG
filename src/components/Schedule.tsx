import React from 'react';
import { Calendar } from 'lucide-react';

const scheduleData = [
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
  if (session.includes('Lớp 6')) return 'bg-[#dcfce7] text-[#166534] font-medium'; // emerald-100
  if (session.includes('Lớp 12')) return 'bg-[#f3e8ff] text-[#6b21a8] font-medium'; // purple-100
  if (session.includes('Lớp 10')) return 'bg-[#fef9c3] text-[#854d0e] font-medium'; // yellow-100
  if (session.includes('Lớp 8')) return 'bg-[#ffedd5] text-[#dc2626] font-bold'; // orange-100, text-red-600
  if (session.includes('Lớp 11')) return 'bg-[#e0f2fe] text-[#075985] font-bold'; // sky-100
  return 'text-slate-600';
};

export function Schedule() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl border border-indigo-100/60 shadow-[0_8px_30px_rgb(79,70,229,0.04)] flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 ring-1 ring-indigo-100/50">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Thời khoá biểu</h2>
          <p className="text-slate-500 text-sm mt-1">Lịch học thêm môn Toán - Thầy Phương</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 w-1/4">Thứ</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-1/4">Sáng</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-1/4">Chiều</th>
                <th className="bg-[#1e3a5f] text-white p-4 font-semibold text-center border-b border-white/20 border-l border-white/10 w-1/4">Tối</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {scheduleData.map((dayData, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                  <td className={`p-4 font-bold text-center border-r border-b border-slate-200 text-[#1e3a5f] ${dayData.day === 'Chủ nhật' ? 'bg-slate-100/50' : 'bg-slate-50/50'}`}>
                    {dayData.day}
                  </td>
                  <td className="p-0 border-r border-b border-slate-200 h-full align-top">
                    {dayData.morning.length > 0 ? (
                      <div className="flex flex-col h-full">
                        {dayData.morning.map((session, i) => (
                          <div key={i} className={`p-4 text-center h-full flex items-center justify-center ${getSessionClass(session)} ${i > 0 ? 'border-t border-slate-200' : ''}`}>
                            {session}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-300 h-full flex items-center justify-center font-medium">-</div>
                    )}
                  </td>
                  <td className="p-0 border-r border-b border-slate-200 h-full align-top">
                    {dayData.afternoon.length > 0 ? (
                       <div className="flex flex-col h-full">
                        {dayData.afternoon.map((session, i) => (
                          <div key={i} className={`p-4 text-center h-full flex items-center justify-center ${getSessionClass(session)} ${i > 0 ? 'border-t border-slate-200' : ''}`}>
                            {session}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-300 h-full flex items-center justify-center font-medium">-</div>
                    )}
                  </td>
                  <td className="p-0 border-b border-slate-200 h-full align-top">
                    {dayData.evening.length > 0 ? (
                       <div className="flex flex-col h-full">
                        {dayData.evening.map((session, i) => (
                          <div key={i} className={`p-4 text-center h-full flex items-center justify-center ${getSessionClass(session)} ${i > 0 ? 'border-t border-slate-200' : ''}`}>
                            {session}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-300 h-full flex items-center justify-center font-medium">-</div>
                    )}
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
