const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const classManagementStateMatch = "function ClassManagement({ userRole, students, setStudents, selectedClass, searchQuery }: { userRole: UserRole, students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, selectedClass: string, searchQuery: string }) {";

const stateUpdates = `
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'dob'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: 'id' | 'name' | 'dob') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
`;

code = code.replace(classManagementStateMatch, classManagementStateMatch + "\n" + stateUpdates);

const displayListRegex = /const displayList = students\.filter\(s => \{[\s\S]*?return matchClass && matchSearch;\s*\}\);/m;

const match = code.match(displayListRegex);
if (match) {
  const newDisplayList = match[0] + `
  
  displayList.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') {
      cmp = String(a.name).localeCompare(String(b.name));
    } else if (sortBy === 'dob') {
      const dateA = new Date(a.dob).getTime() || 0;
      const dateB = new Date(b.dob).getTime() || 0;
      cmp = dateA - dateB;
    } else {
      cmp = String(a.id).localeCompare(String(b.id));
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });
`;
  code = code.replace(displayListRegex, newDisplayList);
}

const tableHeaderRegex = /<thead className="bg-white border-b border-slate-100\/60">[\s\S]*?<\/thead>/m;

const newTableHeader = `<thead className="bg-white border-b border-slate-100/60">
              <tr className="text-xs uppercase text-slate-400 font-bold tracking-wide select-none">
                <th className="px-6 py-4 w-20 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-1">ID {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">Họ và tên {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</div>
                </th>
                {selectedClass === 'all' && (
                  <>
                    <th className="px-6 py-4 w-32 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSort('dob')}>
                      <div className="flex items-center gap-1">Ngày sinh {sortBy === 'dob' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</div>
                    </th>
                    <th className="px-6 py-4 w-32">Lớp</th>
                  </>
                )}
                <th className="px-6 py-4">Môn học</th>
                {userRole === 'admin' && <th className="px-6 py-4 text-center">Xóa</th>}
              </tr>
            </thead>`;

code = code.replace(tableHeaderRegex, newTableHeader);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched sort");
