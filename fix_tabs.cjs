const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add selectedSubjectFilter state
code = code.replace(
  "const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');",
  "const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');\n  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');"
);

// 2. Filter students by subject for children
code = code.replace(
  "const uniqueClasses = Array.from(new Set(students.map",
  "const filteredStudentsBySubject = students.filter(s => selectedSubjectFilter === 'all' || s.subject === selectedSubjectFilter);\n  const uniqueClasses = Array.from(new Set(filteredStudentsBySubject.map"
);

// 3. Render Subject Tabs right above Class Tabs
const subjectTabsHTML = `
        {/* SUBJECT TABS */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center overflow-x-auto no-scrollbar shrink-0">
          <div className="flex space-x-2">
            {['all', 'Toán', 'Vật lý', 'Ngữ văn', 'Tiếng Anh'].map(subj => (
              <button
                key={subj}
                onClick={() => { setSelectedSubjectFilter(subj); setSelectedClassFilter('all'); }}
                className={\`px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 \${
                  selectedSubjectFilter === subj 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }\`}
              >
                {subj === 'all' ? 'Tất cả môn' : subj}
              </button>
            ))}
          </div>
        </div>
        {/* CLASS TABS */}`;

code = code.replace("{/* CLASS TABS */}", subjectTabsHTML);

// 4. Pass filteredStudentsBySubject to the content components
code = code.replace("<Dashboard students={students}", "<Dashboard students={filteredStudentsBySubject}");
code = code.replace("<ClassManagement userRole={userRole} students={students}", "<ClassManagement userRole={userRole} students={filteredStudentsBySubject}");
code = code.replace("<Attendance userRole={userRole} students={students}", "<Attendance userRole={userRole} students={filteredStudentsBySubject}");
code = code.replace("<Academics userRole={userRole} students={students}", "<Academics userRole={userRole} students={filteredStudentsBySubject}");
code = code.replace("<Grades userRole={userRole} students={students}", "<Grades userRole={userRole} students={filteredStudentsBySubject}");

// 5. Update subject options in ClassManagement
// We need to replace:
// <option value="Toán">Toán</option>
// <option value="Tin học">Tin học</option>
// <option value="GDKT-PL">GDKT-PL</option>
// with:
// <option value="Toán">Toán</option>
// <option value="Vật lý">Vật lý</option>
// <option value="Ngữ văn">Ngữ văn</option>
// <option value="Tiếng Anh">Tiếng Anh</option>

code = code.replace(
  /<option value="Toán">Toán<\/option>\s*<option value="Tin học">Tin học<\/option>\s*<option value="GDKT-PL">GDKT-PL<\/option>/g,
  '<option value="Toán">Toán</option>\\n              <option value="Vật lý">Vật lý</option>\\n              <option value="Ngữ văn">Ngữ văn</option>\\n              <option value="Tiếng Anh">Tiếng Anh</option>'
);

fs.writeFileSync('src/App.tsx', code);
