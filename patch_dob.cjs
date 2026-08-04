const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix ClassManagement Table
const cmOldHeader = `{selectedClass === 'all' && (
                  <>
                    <th className="px-6 py-4 w-32 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSort('dob')}>
                      <div className="flex items-center gap-1">Ngày sinh {sortBy === 'dob' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</div>
                    </th>
                    <th className="px-6 py-4 w-32">Lớp</th>
                  </>
                )}`;

const cmNewHeader = `<th className="px-6 py-4 w-36 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSort('dob')}>
                  <div className="flex items-center gap-1">Ngày sinh {sortBy === 'dob' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</div>
                </th>
                <th className="px-6 py-4 w-32">Lớp</th>`;

code = code.replace(cmOldHeader, cmNewHeader);

const cmOldRow = `{selectedClass === 'all' && (
                    <>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                      <td className="px-6 py-4 text-slate-600 font-bold">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                      </td>
                    </>
                  )}`;

const cmNewRow = `<td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                  <td className="px-6 py-4 text-slate-600 font-bold">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                  </td>`;

code = code.replace(cmOldRow, cmNewRow);

code = code.replace(
  "<tr><td colSpan={selectedClass === 'all' ? 6 : 4} className=\"p-12 text-center text-slate-400 font-medium\">Chưa có học sinh nào.</td></tr>",
  "<tr><td colSpan={userRole !== 'student' ? 6 : 5} className=\"p-12 text-center text-slate-400 font-medium\">Chưa có học sinh nào.</td></tr>"
);

// 2. Fix Attendance Table
const attOldHeader = `{selectedClass === 'all' && (
                  <>
                    <th className="px-6 py-3 w-32">Ngày sinh</th>
                    <th className="px-6 py-3 w-32">Lớp</th>
                  </>
                )}`;

const attNewHeader = `<th className="px-6 py-3 w-32">Ngày sinh</th>
                <th className="px-6 py-3 w-32">Lớp</th>`;

code = code.replace(attOldHeader, attNewHeader);

const attOldRow = `{selectedClass === 'all' && (
                    <>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                      <td className="px-6 py-4 text-slate-600 font-bold">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                      </td>
                    </>
                  )}`;

const attNewRow = `<td className="px-6 py-4 text-slate-500 font-medium">{formatDob(student.dob)}</td>
                  <td className="px-6 py-4 text-slate-600 font-bold">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">{student.classRoom}</span>
                  </td>`;

code = code.replace(attOldRow, attNewRow);

code = code.replace(
  "<tr><td colSpan={selectedClass === 'all' ? 7 : 5} className=\"p-12 text-center text-slate-400 font-medium\">Chưa có học sinh nào.</td></tr>",
  "<tr><td colSpan={userRole !== 'student' ? 8 : 7} className=\"p-12 text-center text-slate-400 font-medium\">Chưa có học sinh nào.</td></tr>"
);

// 3. Fix Academics Table
const acadOldHeader = `{selectedClass === 'all' && (
                    <>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 md:sticky md:left-[192px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-28 text-center">Ngày sinh</th>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 md:sticky md:left-[304px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-24 text-center">Lớp</th>
                      <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-100/60 md:sticky md:left-[400px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left">Ghi chú</th>
                    </>
                  )}
                  {selectedClass !== 'all' && (
                    <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-100/60 md:sticky md:left-[192px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left">Ghi chú</th>
                  )}`;

const acadNewHeader = `<th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 md:sticky md:left-[192px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-28 text-center">Ngày sinh</th>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r border-slate-100/60 md:sticky md:left-[304px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-24 text-center">Lớp</th>
                  <th rowSpan={2} className="px-4 py-3 text-xs uppercase text-slate-500 font-bold border-r-2 border-slate-100/60 md:sticky md:left-[400px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left">Ghi chú</th>`;

code = code.replace(acadOldHeader, acadNewHeader);

const acadOldRow = `{selectedClass === 'all' && (
                      <>
                        <td className={\`px-4 py-3 text-xs font-mono text-slate-500 border-r border-slate-200 md:sticky md:left-[192px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>{formatDob(student.dob)}</td>
                        <td className={\`px-4 py-3 text-sm font-medium text-slate-600 border-r border-slate-200 md:sticky md:left-[304px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>{student.classRoom}</td>
                        <td className={\`px-4 py-3 text-sm text-slate-600 border-r-2 border-slate-200 md:sticky md:left-[400px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>
                          <input
                            type="text"
                            placeholder="Nhập ghi chú..."
                            value={student.tuitionNote || ''}
                            onChange={(e) => handleUpdateNote(student.id, e.target.value)}
                            disabled={userRole === 'student'}
                            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-slate-400 disabled:bg-transparent disabled:text-slate-500"
                          />
                        </td>
                      </>
                    )}`;

const acadNewRow = `<td className={\`px-4 py-3 text-xs font-mono text-slate-500 border-r border-slate-200 md:sticky md:left-[192px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>{formatDob(student.dob)}</td>
                    <td className={\`px-4 py-3 text-sm font-medium text-slate-600 border-r border-slate-200 md:sticky md:left-[304px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-center \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>{student.classRoom}</td>
                    <td className={\`px-4 py-3 text-sm text-slate-600 border-r-2 border-slate-200 md:sticky md:left-[400px] md:z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] \${isCurrentMonthUnpaid ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50'}\`}>
                      <input
                        type="text"
                        placeholder="Nhập ghi chú..."
                        value={student.tuitionNote || ''}
                        onChange={(e) => handleUpdateNote(student.id, e.target.value)}
                        disabled={userRole === 'student'}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-slate-400 disabled:bg-transparent disabled:text-slate-500"
                      />
                    </td>`;

code = code.replace(acadOldRow, acadNewRow);

code = code.replace(
  "<tr><td colSpan={selectedClass === 'all' ? 4 + months.length * 2 : 2 + months.length * 2} className=\"p-8 text-center text-slate-500\">Chưa có học sinh nào.</td></tr>",
  "<tr><td colSpan={4 + months.length * 2} className=\"p-8 text-center text-slate-500\">Chưa có học sinh nào.</td></tr>"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched DOB column display");
