const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the block of usersList state and useEffect
const blockRegex = /const \[usersList.*?handleDeleteAccount[\s\S]*?\}\s*;/s;
const match = code.match(blockRegex);

if (match) {
  const block = match[0];
  code = code.replace(block, "");
  
  // Find where showAddAccountModal is defined
  const insertPoint = code.indexOf("const [students, setStudents] = useState<Student[]>([]);");
  code = code.slice(0, insertPoint) + block + '\n  ' + code.slice(insertPoint);
  fs.writeFileSync('src/App.tsx', code);
}
