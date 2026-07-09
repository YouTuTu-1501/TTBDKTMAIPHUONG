import React, { useState, useRef } from 'react';
import { Users, CheckSquare, GraduationCap, Plus, Tag, Trash2, CheckCircle2, Upload, Download, Search, BookOpen, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  const [activeTab, setActiveTab] = useState<'classes' | 'attendance' | 'academics' | 'grades'>('classes');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classTests, setClassTests] = useState<Record<string, string[]>>({
    '10A1': ['Kiểm tra 15p', 'Giữa kỳ'],
  });
  
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
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-[280px] bg-white flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 shrink-0 z-20">
        <div className="p-5">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-fuchsia-400 opacity-20 rounded-full blur-xl"></div>
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group border-2 border-white/20">
                  <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="absolute bottom-0.5 font-black text-[10px] text-indigo-700 tracking-tighter">MP</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  MPEduCenter
                </h1>
              </div>
              <p className="text-[10px] text-indigo-100 opacity-90 font-bold tracking-wider">TRUNG TÂM BDKT MAI PHƯỢNG</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
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
            label="Điểm danh Check-in" 
          />
          <MenuButton 
            active={activeTab === 'academics'} 
            onClick={() => setActiveTab('academics')} 
            icon={<GraduationCap className="w-5 h-5 mr-3" />} 
            label="Quản lý Học phí" 
          />
          <MenuButton 
            active={activeTab === 'grades'} 
            onClick={() => setActiveTab('grades')} 
            icon={<BookOpen className="w-5 h-5 mr-3" />} 
            label="Kết quả học tập" 
          />
        </nav>
        <div className="p-5 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">A</div>
            <div>
              <p className="text-sm font-bold text-slate-700">Admin Master</p>
              <p className="text-xs text-slate-500 font-medium">Quản trị viên</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
        {/* HEADER */}
        <header className="md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between shrink-0 sticky top-0 z-10 gap-3 md:gap-0">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
              {activeTab === 'classes' ? 'Quản lý Lớp học' : activeTab === 'attendance' ? 'Điểm danh Check-in' : activeTab === 'grades' ? 'Kết quả học tập' : 'Quản lý Học phí'}
            </h2>
            <span className="hidden md:flex px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ring-1 ring-emerald-200/50 items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              HOẠT ĐỘNG
            </span>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-auto">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm tên, ID học sinh..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50/50 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 font-medium text-slate-700"
              />
            </div>
          </div>
        </header>

        {/* CLASS TABS */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 px-4 md:px-8 py-3.5 flex items-center overflow-x-auto no-scrollbar shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedClassFilter('all')}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedClassFilter === 'all' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 ring-indigo-500/50' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 shadow-sm'
              }`}
            >
              Tất cả các lớp
            </button>
            {uniqueClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedClassFilter === cls 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 ring-indigo-500/50' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 shadow-sm'
                }`}
              >
                Lớp {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {activeTab === 'classes' && <ClassManagement students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'attendance' && <Attendance students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'academics' && <Academics students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'grades' && <Grades students={students} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} classTests={classTests} setClassTests={setClassTests} />}
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-2 py-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <MobileTabButton 
          active={activeTab === 'classes'} 
          onClick={() => setActiveTab('classes')} 
          icon={<Users className="w-5 h-5" />} 
          label="Lớp học" 
        />
        <MobileTabButton 
          active={activeTab === 'attendance'} 
          onClick={() => setActiveTab('attendance')} 
          icon={<CheckSquare className="w-5 h-5" />} 
          label="Điểm danh" 
        />
        <MobileTabButton 
          active={activeTab === 'academics'} 
          onClick={() => setActiveTab('academics')} 
          icon={<GraduationCap className="w-5 h-5" />} 
          label="Học phí" 
        />
        <MobileTabButton 
          active={activeTab === 'grades'} 
          onClick={() => setActiveTab('grades')} 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Kết quả" 
        />
      </nav>
    </div>
  );
}

// --- SUB COMPONENTS ---

function MobileTabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`${active ? 'scale-110' : ''} transition-transform duration-200 mb-1`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{label}</span>
    </button>
  );
}

function MenuButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'text-indigo-700 bg-indigo-50/80 font-bold shadow-sm border border-indigo-100/50 relative overflow-hidden group' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-full"></div>
      )}
      <div className={`${active ? 'text-indigo-600 scale-110' : 'text-slate-400'} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-sm font-semibold ml-1">{label}</span>
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
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 gap-4">
          <h3 className="text-lg font-bold text-slate-800">Thêm học sinh</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadTemplate} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all shadow-sm flex-1 md:flex-none">
              <Download className="w-4 h-4" /> Tải file mẫu
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all shadow-sm flex-1 md:flex-none">
              <Upload className="w-4 h-4" /> Thêm từ Excel
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
          </div>
        </div>
        <form onSubmit={handleAddStudent} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="w-full md:flex-1 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Họ và tên</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên học sinh..."
              className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-40 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ngày sinh</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-700 transition-all"
              />
            </div>
            <div className="flex-1 md:w-32 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Lớp</label>
              <input 
                type="text" 
                value={classRoom}
                onChange={(e) => setClassRoom(e.target.value)}
                placeholder="VD: 10A1"
                className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Môn học</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none bg-white transition-all"
            >
              <option value="Toán">Toán</option>
              <option value="Tin học">Tin học</option>
              <option value="GDKT-PL">GDKT-PL</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Thêm học sinh
          </button>
        </form>
      </div>

      {/* Danh sách học sinh */}
      <section className="flex flex-col bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Danh sách học sinh</h3>
          <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
            Sĩ số: <span className="font-bold text-indigo-600">{displayList.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100/60">
              <tr className="text-xs uppercase text-slate-400 font-bold tracking-wide">
                <th className="px-6 py-4 w-20">ID</th>
                <th className="px-6 py-4">Họ và tên</th>
                {selectedClass === 'all' && (
                  <>
                    <th className="px-6 py-4 w-32">Ngày sinh</th>
                    <th className="px-6 py-4 w-32">Lớp</th>
                  </>
                )}
                <th className="px-6 py-4">Môn học</th>
                <th className="px-6 py-4 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <tr><td colSpan={selectedClass === 'all' ? 6 : 4} className="p-12 text-center text-slate-400 font-medium">Chưa có học sinh nào.</td></tr>
              ) : displayList.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400/80">{student.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{student.name}</td>
                  {selectedClass === 'all' && (
                    <>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                      <td className="px-6 py-4 text-slate-600 font-bold">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50">
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => removeStudent(student.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4 mx-auto" />
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
      <section className="flex flex-col bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Đánh dấu vào ô để xác nhận vắng học</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100/60">
              <tr className="text-xs uppercase text-slate-400 font-bold tracking-wide">
                <th className="px-6 py-3 w-20 text-center">Vắng học</th>
                <th className="px-6 py-3 w-24">ID</th>
                <th className="px-6 py-3">Họ và tên</th>
                {selectedClass === 'all' && (
                  <>
                    <th className="px-6 py-3 w-32">Ngày sinh</th>
                    <th className="px-6 py-3 w-32">Lớp</th>
                  </>
                )}
                <th className="px-6 py-3">Môn học</th>
                <th className="px-6 py-3 w-32 text-center">Tổng vắng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <tr><td colSpan={selectedClass === 'all' ? 7 : 5} className="p-12 text-center text-slate-400 font-medium">Chưa có học sinh nào.</td></tr>
              ) : displayList.map((student) => (
                <tr 
                  key={student.id} 
                  className={`transition-colors cursor-pointer group ${student.present ? 'bg-rose-50/50 hover:bg-rose-50/80' : 'hover:bg-slate-50/80'}`}
                  onClick={() => toggleAttendance(student.id)}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${student.present ? 'bg-rose-500 border-rose-500' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                        {student.present && <CheckSquare className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400/80">{student.id}</td>
                  <td className={`px-6 py-4 font-bold ${student.present ? 'text-rose-700' : 'text-slate-700'}`}>
                    {student.name}
                  </td>
                  {selectedClass === 'all' && (
                    <>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                      <td className="px-6 py-4 text-slate-600 font-bold">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50">
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAbsences(student.id, -1); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors shadow-sm"
                      >-</button>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shadow-sm ${student.absencesCount ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'bg-slate-100 text-slate-500'}`}>
                        {student.absencesCount || 0}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAbsences(student.id, 1); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors shadow-sm"
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
  const [selectedUnpaidMonth, setSelectedUnpaidMonth] = useState<string>(currentMonthStr);
  
  // Update to handle cases where selectedUnpaidMonth is not in months array by default if it's a new month
  const safeSelectedUnpaidMonth = months.includes(selectedUnpaidMonth) ? selectedUnpaidMonth : months[0];
  const unpaidStudentsList = displayList.filter(s => !s.tuition?.[safeSelectedUnpaidMonth]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Thống kê học phí chưa đóng */}
      <section className="bg-white rounded-2xl border border-rose-100/60 shadow-[0_8px_30px_rgb(225,29,72,0.04)] overflow-hidden">
        <div className="p-5 border-b border-rose-100 flex flex-col sm:flex-row justify-between sm:items-center bg-rose-50/50 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-rose-800 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-rose-500 rounded-full inline-block"></span>
              Chưa đóng học phí
            </h3>
            <select 
              value={safeSelectedUnpaidMonth}
              onChange={(e) => setSelectedUnpaidMonth(e.target.value)}
              className="border border-rose-200 rounded-lg px-2 py-1 text-sm text-rose-700 bg-white font-medium outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
            >
              {months.map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-rose-600 bg-white px-3 py-1 rounded-full border border-rose-200/60 shadow-sm font-bold w-fit">
            Số lượng: {unpaidStudentsList.length}
          </div>
        </div>
        {unpaidStudentsList.length > 0 ? (
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {unpaidStudentsList.map(s => (
                <span key={s.id} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-rose-700 border border-rose-200 shadow-sm transition-all hover:border-rose-300 hover:shadow-md">
                  {s.name} <span className="ml-1 text-rose-400 text-xs">({s.classRoom})</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-emerald-600 font-medium flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            Tất cả học sinh trong danh sách đã đóng học phí tháng {safeSelectedUnpaidMonth}
          </div>
        )}
      </section>

      {/* Phần Học phí */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="font-bold text-slate-800 text-xl mb-4 shrink-0 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
          Thống kê Học phí
        </h3>
        <section className="flex flex-col bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="font-bold text-slate-700">Chi tiết đóng phí (06/2026 - 06/2027)</h3>
            <div className="text-xs text-slate-500 flex gap-4 bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
              <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded-[4px] inline-block shadow-sm"></span> TM: Tiền mặt</span>
              <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded-[4px] inline-block shadow-sm"></span> CK: Chuyển khoản</span>
            </div>
          </div>
          <div className="overflow-auto max-w-full flex-1">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-white border-b-2 border-slate-100/60">
                <tr className="tracking-wide">
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48">Họ và tên</th>
                  {selectedClass === 'all' && (
                    <>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 sticky left-[192px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-28 text-center">Ngày sinh</th>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 sticky left-[304px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-24 text-center">Lớp</th>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-100/60 sticky left-[400px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left">Ghi chú</th>
                    </>
                  )}
                  {selectedClass !== 'all' && (
                    <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-100/60 sticky left-[192px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left">Ghi chú</th>
                  )}
                  {months.map((m, i) => (
                    <th colSpan={2} key={m} className={`px-2 py-2 text-xs uppercase text-slate-600 font-bold text-center border-b border-slate-100/60 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'} border-r-2 border-slate-100/60`}>{m}</th>
                  ))}
                </tr>
                <tr>
                  {months.map((m, i) => (
                    <React.Fragment key={m + '-sub'}>
                      <th className={`px-2 py-1 text-[10px] text-center text-slate-500 font-bold border-r border-slate-100/60 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`} title="Tiền mặt">TM</th>
                      <th className={`px-2 py-1 text-[10px] text-center text-slate-500 font-bold border-r-2 border-slate-100/60 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`} title="Chuyển khoản">CK</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.length === 0 ? (
                  <tr><td colSpan={selectedClass === 'all' ? 4 + months.length * 2 : 2 + months.length * 2} className="p-8 text-center text-slate-500">Chưa có học sinh nào.</td></tr>
                ) : displayList.map((student) => {
                  const isCurrentMonthUnpaid = months.includes(currentMonthStr) && !student.tuition?.[currentMonthStr];

                  return (
                  <tr key={student.id} className={`transition-colors group ${isCurrentMonthUnpaid ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-indigo-50/30'}`}>
                    <td className={`px-4 py-3 font-semibold text-slate-700 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>
                      {student.name}
                      {isCurrentMonthUnpaid && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 align-middle" title="Chưa đóng học phí tháng này"></span>}
                    </td>
                    {selectedClass === 'all' && (
                      <>
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
                      </>
                    )}
                    {selectedClass !== 'all' && (
                      <td className={`px-4 py-3 text-sm text-slate-600 border-r-2 border-slate-200 sticky left-[192px] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}`}>
                        <input
                          type="text"
                          placeholder="Nhập ghi chú..."
                          value={student.tuitionNote || ''}
                          onChange={(e) => handleUpdateNote(student.id, e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-slate-400"
                        />
                      </td>
                    )}
                    {months.map((m, i) => {
                      const tuitionData = student.tuition?.[m];
                      const isCash = tuitionData?.method === 'cash';
                      const isTransfer = tuitionData?.method === 'transfer';
                      const date = tuitionData?.date;
                      const isCurrentMonthUnpaidCell = m === currentMonthStr && isCurrentMonthUnpaid;

                      return (
                        <React.Fragment key={m + '-cells'}>
                          <td className={`px-2 py-2 text-center border-r border-slate-100 relative group/cell transition-colors ${i % 2 === 0 ? 'bg-slate-50/50' : ''} ${isCash ? 'bg-emerald-200/80 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.4)]' : ''} ${isCurrentMonthUnpaidCell ? 'bg-amber-100/50' : ''}`}>
                            <div className="flex justify-center items-center w-full h-full">
                              <input 
                                type="checkbox" 
                                checked={isCash} 
                                onChange={() => handleToggleTuition(student.id, m, 'cash')}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                              />
                            </div>
                            {isCash && date && (
                              <div className="absolute hidden group-hover/cell:block bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-30 shadow-lg">
                                {date}
                              </div>
                            )}
                          </td>
                          <td className={`px-2 py-2 text-center border-r-2 border-slate-200 relative group/cell transition-colors ${i % 2 === 0 ? 'bg-slate-50/50' : ''} ${isTransfer ? 'bg-indigo-200/80 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.4)]' : ''} ${isCurrentMonthUnpaidCell ? 'bg-amber-100/50' : ''}`}>
                            <div className="flex justify-center items-center w-full h-full">
                              <input 
                                type="checkbox" 
                                checked={isTransfer} 
                                onChange={() => handleToggleTuition(student.id, m, 'transfer')}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
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


function Grades({ students, setStudents, selectedClass, searchQuery, classTests, setClassTests }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, selectedClass: string, searchQuery: string, classTests: Record<string, string[]>, setClassTests: React.Dispatch<React.SetStateAction<Record<string, string[]>>> }) {
  if (selectedClass === 'all') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500">
        <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Vui lòng chọn một lớp cụ thể</h3>
        <p className="text-sm">Kết quả học tập được quản lý theo từng lớp. Hãy chọn một lớp từ menu bên trên.</p>
      </div>
    );
  }

  const tests = classTests[selectedClass] || [];
  const displayList = students.filter(s => s.classRoom === selectedClass && (searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())));

  const chartData = [
    { name: 'Kém (<5)', count: 0, color: '#ef4444' },
    { name: 'TB (5-6.5)', count: 0, color: '#f59e0b' },
    { name: 'Khá (6.5-8)', count: 0, color: '#3b82f6' },
    { name: 'Giỏi (8-10)', count: 0, color: '#10b981' },
  ];

  let hasChartData = false;
  displayList.forEach(student => {
    if (!tests.length || !student.grades) return;
    let total = 0;
    let count = 0;
    tests.forEach(test => {
      const scoreStr = student.grades?.[test];
      const parsed = parseFloat((scoreStr || '').replace(',', '.'));
      if (!isNaN(parsed)) {
        total += parsed;
        count++;
      }
    });
    if (count > 0) {
      hasChartData = true;
      const avg = total / count;
      if (avg < 5) chartData[0].count++;
      else if (avg < 6.5) chartData[1].count++;
      else if (avg < 8) chartData[2].count++;
      else chartData[3].count++;
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100/60">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
            Số lượng: {payload[0].value} học sinh
          </p>
        </div>
      );
    }
    return null;
  };

  const handleAddTest = () => {
    const testName = prompt('Nhập tên bài kiểm tra mới (VD: Giữa kỳ 1):');
    if (testName && testName.trim()) {
      setClassTests(prev => ({
        ...prev,
        [selectedClass]: [...(prev[selectedClass] || []), testName.trim()]
      }));
    }
  };

  const handleUpdateGrade = (studentId: string, testName: string, value: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          grades: {
            ...s.grades,
            [testName]: value
          }
        };
      }
      return s;
    }));
  };

  const handleDeleteTest = (testName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra "${testName}"?`)) {
      setClassTests(prev => ({
        ...prev,
        [selectedClass]: prev[selectedClass].filter(t => t !== testName)
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {hasChartData && (
        <section className="bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Phân bổ điểm trung bình lớp {selectedClass}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="flex flex-col bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
            Kết quả học tập - Lớp {selectedClass}
          </h3>
          <button 
            onClick={handleAddTest}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm bài kiểm tra
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-white border-b border-slate-100/60">
              <tr className="text-xs uppercase text-slate-500 font-bold tracking-wide">
                <th className="px-6 py-4 w-16 border-r border-slate-100/60 sticky left-0 bg-white z-10">ID</th>
                <th className="px-6 py-4 border-r-2 border-slate-100/60 sticky left-[64px] bg-white z-10 w-48">Họ và tên</th>
                {tests.map(test => (
                  <th key={test} className="px-4 py-4 text-center border-r border-slate-100/60 relative group min-w-[120px]">
                    <div className="flex items-center justify-center gap-2">
                      {test}
                      <button onClick={() => handleDeleteTest(test)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
                {tests.length === 0 && <th className="px-6 py-4 text-slate-400 font-medium">Chưa có bài kiểm tra nào</th>}
                <th className="px-6 py-4 text-center font-bold text-indigo-700 w-32 border-l-2 border-slate-100/60 sticky right-0 bg-indigo-50/80 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">Trung bình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <tr><td colSpan={tests.length + 3} className="p-12 text-center text-slate-400 font-medium">Không có học sinh nào.</td></tr>
              ) : displayList.map(student => {
                let avg = -1;
                if (tests.length && student.grades) {
                  let total = 0;
                  let count = 0;
                  tests.forEach(test => {
                    const scoreStr = student.grades?.[test];
                    const parsed = parseFloat((scoreStr || '').replace(',', '.'));
                    if (!isNaN(parsed)) {
                      total += parsed;
                      count++;
                    }
                  });
                  if (count > 0) avg = total / count;
                }
                const isBelowAvg = avg !== -1 && avg < 5;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400/80 border-r border-slate-100/60 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10">{student.id}</td>
                    <td className={`px-6 py-4 font-bold border-r-2 border-slate-100/60 sticky left-[64px] z-10 ${isBelowAvg ? 'bg-red-50 text-red-700 group-hover:bg-red-100/80' : 'bg-white text-slate-700 group-hover:bg-slate-50/80'}`}>{student.name}</td>
                    {tests.map(test => (
                      <td key={test} className="px-2 py-2 border-r border-slate-100/60">
                        <input 
                          type="text"
                          placeholder="-"
                          value={student.grades?.[test] || ''}
                          onChange={(e) => handleUpdateGrade(student.id, test, e.target.value)}
                          className="w-full text-center bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                        />
                      </td>
                    ))}
                    {tests.length === 0 && <td></td>}
                    <td className={`px-6 py-4 text-center font-bold sticky right-0 z-10 border-l-2 border-slate-100/60 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] ${isBelowAvg ? 'bg-red-50/80 text-red-700 group-hover:bg-red-100' : 'bg-indigo-50/30 text-indigo-700 group-hover:bg-indigo-50/80'}`}>
                      {avg !== -1 ? avg.toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
