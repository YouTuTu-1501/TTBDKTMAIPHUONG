const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Restrict "Thêm học sinh" and "Xóa học sinh" to admin
// In ClassManagement, we have {userRole !== 'student' && ( ... form ... )}
// Let's change it to {userRole === 'admin' && ( ... form ... )}
code = code.replace(
  "{userRole !== 'student' && (\n      <div className=\"bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6\">\n        <div className=\"flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 gap-4\">",
  "{userRole === 'admin' && (\n      <div className=\"bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6\">\n        <div className=\"flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 gap-4\">"
);

// In ClassManagement table headers:
code = code.replace(
  "{userRole !== 'student' && <th className=\"px-6 py-4 text-center\">Xóa</th>}",
  "{userRole === 'admin' && <th className=\"px-6 py-4 text-center\">Xóa</th>}"
);

// In ClassManagement table body (delete button):
// This is inside a `<td>` inside `userRole !== 'student'` for edit AND delete.
// Let's change the delete button inside that to check for 'admin'
code = code.replace(
  "<button onClick={(e) => { e.stopPropagation(); setStudentToDelete(student); }} className=\"p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors\">\n                            <Trash2 className=\"w-4 h-4\" />\n                          </button>",
  "{userRole === 'admin' && (\n                            <button onClick={(e) => { e.stopPropagation(); setStudentToDelete(student); }} className=\"p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors\">\n                              <Trash2 className=\"w-4 h-4\" />\n                            </button>\n                          )}"
);

// Delete student function
code = code.replace(
  "const handleDeleteStudent = () => {\n    if (userRole === 'student' || !studentToDelete) return;",
  "const handleDeleteStudent = () => {\n    if (userRole !== 'admin' || !studentToDelete) return;"
);

// Add student function
code = code.replace(
  "const handleAddStudent = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (userRole === 'student') return;",
  "const handleAddStudent = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (userRole !== 'admin') return;"
);

fs.writeFileSync('src/App.tsx', code);
