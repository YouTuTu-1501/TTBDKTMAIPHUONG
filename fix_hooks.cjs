const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the block from usersList to emails
const extractRegex = /const \[usersList.*?setUsersList\(list\);\s*\}\);\s*\}\);\s*\}\s*\}, \[userRole, showAddAccountModal\]\);[\s\S]*?const handleDeleteAccount.*?\}\s*\};\s*/s;

const match = code.match(extractRegex);
if (match) {
  const block = match[0];
  code = code.replace(block, "");
  
  // Insert it after `const [emails, setEmails]`
  const insertPoint = code.indexOf("const [emails, setEmails] = useState<{id: string, text: string, type: 'warning' | 'info'}[]>([]);") + "const [emails, setEmails] = useState<{id: string, text: string, type: 'warning' | 'info'}[]>([]);".length;
  code = code.slice(0, insertPoint) + "\n\n  " + block + code.slice(insertPoint);
  fs.writeFileSync('src/App.tsx', code);
}
