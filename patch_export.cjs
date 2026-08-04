const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const exportFunc = `
  const handleExportTuitionToExcel = () => {
    const wsData = [];
    // Header
    const header = ['Họ và tên', 'Ngày sinh', 'Lớp', 'Ghi chú'];
    months.forEach(m => {
      header.push(m + ' (TM)');
      header.push(m + ' (CK)');
    });
    wsData.push(header);

    // Data
    displayList.forEach(student => {
      const row = [
        student.name,
        formatDob(student.dob),
        student.classRoom,
        student.tuitionNote || ''
      ];
      months.forEach(m => {
        const t = student.tuition?.[m];
        if (t && t.method === 'cash') {
          row.push('x');
          row.push('');
        } else if (t && t.method === 'transfer') {
          row.push('');
          row.push('x');
        } else {
          row.push('');
          row.push('');
        }
      });
      wsData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HocPhi');
    XLSX.writeFile(wb, 'DanhSachHocPhi.xlsx');
  };
`;

code = code.replace(
  "const handleToggleTuition = (id: string, month: string, method: 'cash' | 'transfer') => {",
  exportFunc + "\n  const handleToggleTuition = (id: string, month: string, method: 'cash' | 'transfer') => {"
);

const oldUI = `<div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="font-bold text-slate-700">Chi tiết đóng phí (06/2026 - 06/2027)</h3>
            <div className="text-xs text-slate-500 flex gap-4 bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
              <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded-[4px] inline-block shadow-sm"></span> TM: Tiền mặt</span>
              <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded-[4px] inline-block shadow-sm"></span> CK: Chuyển khoản</span>
            </div>
          </div>`;

const newUI = `<div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="font-bold text-slate-700">Chi tiết đóng phí (06/2026 - 06/2027)</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-xs text-slate-500 flex gap-4 bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
                <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded-[4px] inline-block shadow-sm"></span> TM: Tiền mặt</span>
                <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded-[4px] inline-block shadow-sm"></span> CK: Chuyển khoản</span>
              </div>
              <button onClick={handleExportTuitionToExcel} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Xuất Excel
              </button>
            </div>
          </div>`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/App.tsx', code);
