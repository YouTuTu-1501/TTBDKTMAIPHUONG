const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will find the fetchData function inside useEffect and normalize the data immediately after loading from Firebase.
code = code.replace(
  "if (data.students) setStudents(data.students);",
  "if (data.students) setStudents(data.students.map((s: any) => ({ ...s, classRoom: String(s.classRoom || '').trim().replace(/\\s+/g, ' ') || 'Chưa xếp lớp' })));"
);

fs.writeFileSync('src/App.tsx', code);
