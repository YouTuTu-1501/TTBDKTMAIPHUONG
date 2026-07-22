const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleExcelUpload = `
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        
        const rows = json.filter(row => row.length >= 2);
        const hasHeader = rows.length > 0 && String(rows[0][0]).toLowerCase().includes('email');
        const dataRows = hasHeader ? rows.slice(1) : rows;

        const csvData = dataRows.map(row => \`\${row[0] || ''},\${row[1] || ''},\${row[2] || 'student'}\`).join('\\n');
        setBulkAccData(prev => (prev ? prev + '\\n' + csvData : csvData));
      } catch (err) {
        console.error("Error parsing excel", err);
        setNewAccError("Lỗi khi đọc file Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleDownloadSample = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Email', 'Mật khẩu', 'Phân quyền (student/teacher/admin)'],
      ['hocsinh1@example.com', '123456', 'student'],
      ['giaovien1@example.com', '123456', 'teacher']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, 'Mau_Tao_Tai_Khoan.xlsx');
  };
`;

code = code.replace(
  "  const handleBulkCreateAccount = async () => {",
  handleExcelUpload + "\n  const handleBulkCreateAccount = async () => {"
);

const oldUI = `<p className="text-xs text-slate-500 mb-2">Định dạng: Email,Mật khẩu,Quyền (VD: <b>a@g.com,123456,student</b>). Quyền mặc định là student.</p>`;
const newUI = `<p className="text-xs text-slate-500 mb-2">Định dạng: Email,Mật khẩu,Quyền (VD: <b>a@g.com,123456,student</b>). Quyền mặc định là student.</p>
                      <div className="flex gap-2 mb-2">
                        <button onClick={handleDownloadSample} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          Tải file mẫu
                        </button>
                        <label className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          Nhập từ Excel
                          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                        </label>
                      </div>`;
code = code.replace(oldUI, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Excel functions");
