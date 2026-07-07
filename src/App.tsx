import React, { useState, useRef } from 'react';
import { Users, CheckSquare, GraduationCap, Plus, Tag, Trash2, CheckCircle2, Upload, Download, Search } from 'lucide-react';
import { Student } from './types';
import * as XLSX from 'xlsx';

const formatDob = (dob: string) => {
  if (!dob) return '---';
  if (!isNaN(Number(dob)) && Number(dob) > 10000) {
    const date = new Date((Number(dob) - 25569) * 86400 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  if (dob.includes('-')) {
    const parts = dob.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dob;
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'classes' | 'attendance' | 'academics'>('classes');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Trạng thái lưu trữ danh sách học sinh (Mock dữ liệu ban đầu)
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Nguyễn Văn A', dob: '2010-01-15', subject: 'Toán', classRoom: '10A1', present: false, absencesCount: 2, tags: [] },
    { id: '2', name: 'Trần Thị B', dob: '2009-05-20', subject: 'Tin học', classRoom: '11B2', present: false, absencesCount: 0, tags: [] },
    { id: '3', name: 'Lê Văn C', dob: '2008-11-03', subject: 'GDKT-PL', classRoom: '12C3', present: false, absencesCount: 5, tags: ['Lộ trình lấy lại kiến thức căn bản'] },
  ]);

  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('lastAttendanceReset');
    if (lastReset !== today) {
      setStudents(prev => prev.map(s => ({ ...s, present: false })));
      localStorage.setItem('lastAttendanceReset', today);
    }
    
    // Check every minute if the day has changed while app is open
    const interval = setInterval(() => {
      const currentDay = new Date().toISOString().split('T')[0];
      if (localStorage.getItem('lastAttendanceReset') !== currentDay) {
        setStudents(prev => prev.map(s => ({ ...s, present: false })));
        localStorage.setItem('lastAttendanceReset', currentDay);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const uniqueClasses = Array.from(new Set(students.map(s => s.classRoom).filter(Boolean)));

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1E293B] flex flex-col shadow-xl shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-sm">EDU</span>
            EduCenter
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý Dạy thêm</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <MenuButton 
            active={activeTab === 'classes'} 
            onClick={() => setActiveTab('classes')} 
            icon={<Users className="w-5 h-5 mr-3" />} 
            label="Quản lý Lớp học" 
          />
          <MenuButton 
            active={activeTab === 'attendance'} 
            onClick={() => setActiveTab('attendance')} 
            icon={<CheckSquare className="w-5 h-5 mr-3" />} 
            label="Điểm danh" 
          />
          <MenuButton 
            active={activeTab === 'academics'} 
            onClick={() => setActiveTab('academics')} 
            icon={<GraduationCap className="w-5 h-5 mr-3" />} 
            label="Quản lý Học phí" 
          />
        </nav>
        <div className="p-4 mt-auto border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 border border-slate-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-sm font-medium text-white">Admin Master</p>
              <p className="text-xs text-slate-400">Quản trị viên</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {activeTab === 'classes' ? 'Quản lý Lớp học' : activeTab === 'attendance' ? 'Điểm danh Check-in' : 'Quản lý Học phí'}
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">HOẠT ĐỘNG</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tên, ID học sinh..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50"
              />
            </div>
          </div>
        </header>

        {/* CLASS TABS */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 flex items-center overflow-x-auto no-scrollbar shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedClassFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedClassFilter === 'all' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
              }`}
            >
              Tất cả các lớp
            </button>
            {uniqueClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedClassFilter === cls 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
                }`}
              >
                Lớp {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {activeTab === 'classes' && <ClassManagement students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'attendance' && <Attendance students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'academics' && <Academics students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function MenuButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'text-slate-300 bg-slate-800' 
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ClassManagement({ students, setStudents, selectedClass, searchQuery }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, selectedClass: string, searchQuery: string }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [subject, setSubject] = useState('Toán');
  const [classRoom, setClassRoom] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayList = students.filter(s => {
    const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;
    const matchSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });
  const targetClass = classRoom.trim() || 'Chưa xếp lớp';

  // Hàm xử lý thêm học sinh mới
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newStudent: Student = {
      id: `ST${String(Date.now()).slice(-4)}`,
      name: name.trim(),
      dob: dob.trim(),
      subject,
      classRoom: targetClass,
      present: false, // Mặc định chưa điểm danh
      tags: []
    };

    setStudents([...students, newStudent]);
    setName(''); // Reset form
    setDob('');
    setClassRoom('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const ab = evt.target?.result;
      const wb = XLSX.read(ab, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const newStudents: Student[] = data.map((row: any, index: number) => {
        let dobStr = row['Ngày sinh'] || '';
        if (typeof dobStr === 'number') {
          const date = new Date((dobStr - 25569) * 86400 * 1000);
          const y = date.getUTCFullYear();
          const m = String(date.getUTCMonth() + 1).padStart(2, '0');
          const d = String(date.getUTCDate()).padStart(2, '0');
          dobStr = `${y}-${m}-${d}`;
        } else if (typeof dobStr === 'string' && dobStr.includes('/')) {
           const parts = dobStr.split('/');
           if (parts.length === 3 && parts[2].length === 4) {
             dobStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
           }
        }

        return {
          id: `ST${String(Date.now() + index).slice(-4)}`,
          name: row['Họ và tên'] || '',
          dob: dobStr,
          subject: row['Môn học'] || 'Toán',
          classRoom: row['Lớp'] || targetClass,
          present: false,
          absencesCount: 0,
          tags: []
        };
      }).filter((s: Student) => s.name);

      setStudents(prev => [...prev, ...newStudents]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Họ và tên': 'Nguyễn Văn Mẫu', 'Ngày sinh': '2010-01-15', 'Lớp': '10A1', 'Môn học': 'Toán' },
      { 'Họ và tên': 'Trần Thị B', 'Ngày sinh': '2009-05-20', 'Lớp': '10A1', 'Môn học': 'Toán' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_sach");
    XLSX.writeFile(wb, "Template_HocSinh.xlsx");
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Form Thêm Học Sinh */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-700">Thêm học sinh</h3>
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Tải file mẫu
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
              <Upload className="w-4 h-4" /> Thêm từ Excel
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
          </div>
        </div>
        <form onSubmit={handleAddStudent} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Họ và tên</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên học sinh..."
              className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="w-40 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ngày sinh</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700"
            />
          </div>
          <div className="w-32 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lớp</label>
            <input 
              type="text" 
              value={classRoom}
              onChange={(e) => setClassRoom(e.target.value)}
              placeholder="VD: 10A1"
              className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="w-48 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Môn học</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="Toán">Toán</option>
              <option value="Tin học">Tin học</option>
              <option value="GDKT-PL">GDKT-PL</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-all h-[42px]"
          >
            <Plus className="w-4 h-4" />
            Thêm học sinh
          </button>
        </form>
      </div>

      {/* Danh sách học sinh */}
      <section className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Danh sách học sinh</h3>
          <div className="text-sm text-slate-500">
            Sĩ số: <span className="font-bold text-indigo-600">{displayList.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
              <tr className="text-xs uppercase text-slate-400 font-bold">
                <th className="px-6 py-3 w-20">ID</th>
                <th className="px-6 py-3">Họ và tên</th>
                <th className="px-6 py-3 w-32">Ngày sinh</th>
                <th className="px-6 py-3 w-32">Lớp</th>
                <th className="px-6 py-3">Môn học</th>
                <th className="px-6 py-3 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Chưa có học sinh nào.</td></tr>
              ) : displayList.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{student.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatDob(student.dob)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{student.classRoom}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-slate-100 text-slate-700">
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => removeStudent(student.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Attendance({ students, setStudents, selectedClass, searchQuery }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, selectedClass: string, searchQuery: string }) {
  const displayList = students.filter(s => {
    const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;
    const matchSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const toggleAttendance = (id: string) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const isAbsentNow = !s.present;
        const currentCount = s.absencesCount || 0;
        return { 
          ...s, 
          present: isAbsentNow,
          absencesCount: isAbsentNow ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      }
      return s;
    }));
  };

  const updateAbsences = (id: string, delta: number) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const current = s.absencesCount || 0;
        return { ...s, absencesCount: Math.max(0, current + delta) };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Đánh dấu vào ô để xác nhận vắng học</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
              <tr className="text-xs uppercase text-slate-400 font-bold">
                <th className="px-6 py-3 w-20 text-center">Vắng học</th>
                <th className="px-6 py-3 w-24">ID</th>
                <th className="px-6 py-3">Họ và tên</th>
                <th className="px-6 py-3 w-32">Ngày sinh</th>
                <th className="px-6 py-3 w-32">Lớp</th>
                <th className="px-6 py-3">Môn học</th>
                <th className="px-6 py-3 w-32 text-center">Tổng vắng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Chưa có học sinh nào.</td></tr>
              ) : displayList.map((student) => (
                <tr 
                  key={student.id} 
                  className={`transition-colors cursor-pointer group ${student.present ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}
                  onClick={() => toggleAttendance(student.id)}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <input 
                        type="checkbox" 
                        checked={student.present}
                        onChange={() => toggleAttendance(student.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{student.id}</td>
                  <td className={`px-6 py-4 font-semibold ${student.present ? 'text-rose-700' : 'text-slate-700'}`}>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatDob(student.dob)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{student.classRoom}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-slate-100 text-slate-700">
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAbsences(student.id, -1); }}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      >-</button>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-sm font-bold ${student.absencesCount ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                        {student.absencesCount || 0}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAbsences(student.id, 1); }}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      >+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Academics({ students, setStudents, selectedClass, searchQuery }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, selectedClass: string, searchQuery: string }) {
  const displayList = students.filter(s => {
    const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;
    const matchSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const months = [
    '06/2026', '07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026', 
    '01/2027', '02/2027', '03/2027', '04/2027', '05/2027', '06/2027'
  ];

  const handleToggleTuition = (id: string, month: string, method: 'cash' | 'transfer') => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const currentTuition = s.tuition || {};
        const currentMonthData = currentTuition[month];
        
        let newMonthData;
        if (currentMonthData?.method === method) {
          // Bỏ check
          newMonthData = undefined;
        } else {
          // Đánh dấu mới
          const today = new Date().toISOString().split('T')[0];
          newMonthData = { method, date: today };
        }

        return {
          ...s,
          tuition: {
            ...currentTuition,
            [month]: newMonthData as any
          }
        };
      }
      return s;
    }));
  };

  const handleUpdateNote = (id: string, note: string) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        return { ...s, tuitionNote: note };
      }
      return s;
    }));
  };

  const currentMonthStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Phần Học phí */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="font-bold text-slate-800 text-lg mb-4 shrink-0">Thống kê Học phí</h3>
        <section className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="font-bold text-slate-700">Chi tiết đóng phí (06/2026 - 06/2027)</h3>
            <div className="text-xs text-slate-500 flex gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm inline-block"></span> TM: Tiền mặt</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-sm inline-block"></span> CK: Chuyển khoản</span>
            </div>
          </div>
          <div className="overflow-auto max-w-full flex-1">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-white border-b-2 border-slate-200">
                <tr>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-200 sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] w-48">Họ và tên</th>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-200 sticky left-[192px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] w-28 text-center">Ngày sinh</th>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-200 sticky left-[304px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] w-24 text-center">Lớp</th>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-200 sticky left-[400px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] w-48 text-left">Ghi chú</th>
                  {months.map((m, i) => (
                    <th colSpan={2} key={m} className={`px-2 py-2 text-xs uppercase text-slate-600 font-bold text-center border-b border-slate-200 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-r-2 border-slate-200`}>{m}</th>
                  ))}
                </tr>
                <tr>
                  {months.map((m, i) => (
                    <React.Fragment key={m + '-sub'}>
                      <th className={`px-2 py-1 text-[10px] text-center text-slate-500 font-bold border-r border-slate-100 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`} title="Tiền mặt">TM</th>
                      <th className={`px-2 py-1 text-[10px] text-center text-slate-500 font-bold border-r-2 border-slate-200 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`} title="Chuyển khoản">CK</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.length === 0 ? (
                  <tr><td colSpan={4 + months.length * 2} className="p-8 text-center text-slate-500">Chưa có học sinh nào.</td></tr>
                ) : displayList.map((student) => {
                  const isCurrentMonthUnpaid = months.includes(currentMonthStr) && !student.tuition?.[currentMonthStr];

                  return (
                  <tr key={student.id} className={`transition-colors group ${isCurrentMonthUnpaid ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-indigo-50/30'}`}>
                    <td className={`px-4 py-3 font-semibold text-slate-700 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>
                      {student.name}
                      {isCurrentMonthUnpaid && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 align-middle" title="Chưa đóng học phí tháng này"></span>}
                    </td>
                    <td className={`px-4 py-3 text-xs font-mono text-slate-500 border-r border-slate-200 sticky left-[192px] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>{formatDob(student.dob)}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-slate-600 border-r border-slate-200 sticky left-[304px] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>{student.classRoom}</td>
                    <td className={`px-4 py-3 text-sm text-slate-600 border-r-2 border-slate-200 sticky left-[400px] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>
                      <input
                        type="text"
                        placeholder="Nhập ghi chú..."
                        value={student.tuitionNote || ''}
                        onChange={(e) => handleUpdateNote(student.id, e.target.value)}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-slate-400"
                      />
                    </td>
                    {months.map((m, i) => {
                      const tuitionData = student.tuition?.[m];
                      const isCash = tuitionData?.method === 'cash';
                      const isTransfer = tuitionData?.method === 'transfer';
                      const date = tuitionData?.date;
                      const isCurrentMonthUnpaidCell = m === currentMonthStr && isCurrentMonthUnpaid;

                      return (
                        <React.Fragment key={m + '-cells'}>
                          <td className={`px-2 py-2 text-center border-r border-slate-100 relative group/cell ${i % 2 === 0 ? 'bg-slate-50/50' : ''} ${isCash ? 'bg-emerald-50' : ''} ${isCurrentMonthUnpaidCell ? 'bg-amber-100/50' : ''}`}>
                            <div className="flex justify-center items-center w-full h-full">
                              <input 
                                type="checkbox" 
                                checked={isCash} 
                                onChange={() => handleToggleTuition(student.id, m, 'cash')}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            {isCash && date && (
                              <div className="absolute hidden group-hover/cell:block bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-30">
                                {date}
                              </div>
                            )}
                          </td>
                          <td className={`px-2 py-2 text-center border-r-2 border-slate-200 relative group/cell ${i % 2 === 0 ? 'bg-slate-50/50' : ''} ${isTransfer ? 'bg-indigo-50' : ''} ${isCurrentMonthUnpaidCell ? 'bg-amber-100/50' : ''}`}>
                            <div className="flex justify-center items-center w-full h-full">
                              <input 
                                type="checkbox" 
                                checked={isTransfer} 
                                onChange={() => handleToggleTuition(student.id, m, 'transfer')}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                              />
                            </div>
                            {isTransfer && date && (
                              <div className="absolute hidden group-hover/cell:block bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-30">
                                {date}
                              </div>
                            )}
                          </td>
                        </React.Fragment>
                      )
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

