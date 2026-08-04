const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const exportFunc = `
  const handleExportStudentsToExcel = () => {
    const wsData = [];
    const header = ['ID', 'Họ và tên', 'Ngày sinh', 'Lớp', 'Môn học'];
    wsData.push(header);

    displayList.forEach(student => {
      wsData.push([
        student.id,
        student.name,
        formatDob(student.dob),
        student.classRoom,
        student.subject
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');
    XLSX.writeFile(wb, 'DanhSachHocSinh.xlsx');
  };
`;

code = code.replace(
  "  const handleAddStudent = (e: React.FormEvent) => {",
  exportFunc + "\n  const handleAddStudent = (e: React.FormEvent) => {"
);

const oldUI = `<div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Danh sách học sinh</h3>
          <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
            Sĩ số: <span className="font-bold text-indigo-600">{displayList.length}</span>
          </div>
        </div>`;

const newUI = `<div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Danh sách học sinh</h3>
          <div className="flex gap-4 items-center">
            <button onClick={handleExportStudentsToExcel} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Xuất Excel
            </button>
            <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
              Sĩ số: <span className="font-bold text-indigo-600">{displayList.length}</span>
            </div>
          </div>
        </div>`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Class export");
