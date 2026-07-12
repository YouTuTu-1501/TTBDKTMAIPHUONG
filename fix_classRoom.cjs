const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const targetClass = classRoom.trim() || 'Chưa xếp lớp';",
  "const targetClass = classRoom.trim().replace(/\\s+/g, ' ') || (selectedClass !== 'all' ? selectedClass : 'Chưa xếp lớp');"
);

code = code.replace(
  "classRoom: String(editClassRoom || '') || 'Chưa xếp lớp'",
  "classRoom: String(editClassRoom || '').trim().replace(/\\s+/g, ' ') || (selectedClass !== 'all' ? selectedClass : 'Chưa xếp lớp')"
);

code = code.replace(
  "classRoom: String(row['Lớp'] || targetClass),",
  "classRoom: String(row['Lớp'] || targetClass).trim().replace(/\\s+/g, ' '),"
);

// We should also replace where classRoom is matched
code = code.replace(
  "const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;",
  "const matchClass = selectedClass === 'all' || String(s.classRoom || '').trim().replace(/\\s+/g, ' ') === selectedClass;"
);
code = code.replace(
  "const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;",
  "const matchClass = selectedClass === 'all' || String(s.classRoom || '').trim().replace(/\\s+/g, ' ') === selectedClass;"
);
code = code.replace(
  "const matchClass = selectedClass === 'all' || s.classRoom === selectedClass;",
  "const matchClass = selectedClass === 'all' || String(s.classRoom || '').trim().replace(/\\s+/g, ' ') === selectedClass;"
);

// and in Grades:
code = code.replace(
  "const displayList = students.filter(s => s.classRoom === selectedClass && (searchQuery === ''",
  "const displayList = students.filter(s => String(s.classRoom || '').trim().replace(/\\s+/g, ' ') === selectedClass && (searchQuery === ''"
);

fs.writeFileSync('src/App.tsx', code);
