const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace uniqueClasses
code = code.replace(
  "const uniqueClasses = Array.from(new Set(students.map(s => s.classRoom).filter(Boolean)));",
  "const uniqueClasses = Array.from(new Set(students.map(s => (s.classRoom || '').trim().replace(/\\s+/g, ' ')).filter(Boolean)));"
);

fs.writeFileSync('src/App.tsx', code);
