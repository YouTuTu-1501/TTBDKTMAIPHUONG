const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const filteredStudentsBySubject = students.filter(s => selectedSubjectFilter === 'all' || s.subject === selectedSubjectFilter);",
  `const filteredStudentsBySubject = students.filter(s => {
    if (selectedSubjectFilter !== 'all' && s.subject !== selectedSubjectFilter) return false;
    if (userRole === 'student') {
      return s.email && s.email.toLowerCase() === currentUser?.email?.toLowerCase();
    }
    return true;
  });`
);

fs.writeFileSync('src/App.tsx', code);
