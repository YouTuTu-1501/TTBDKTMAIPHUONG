const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The hooks are from `React.useEffect(() => { \n    if (!currentUser) return;` down to `return () => clearInterval(interval);\n  }, [isFirebaseLoaded, lastAttendanceReset]);`

const match = code.match(/React\.useEffect\(\(\) => \{\s*if \(\!currentUser\) return;.*?\}, \[isFirebaseLoaded, lastAttendanceReset\]\);/s);

if (match) {
  const hooksBlock = match[0];
  code = code.replace(hooksBlock, "");
  
  // Find `if (loadingAuth)`
  const insertIndex = code.indexOf("if (loadingAuth) {");
  
  code = code.slice(0, insertIndex) + hooksBlock + '\n\n  ' + code.slice(insertIndex);
  
  fs.writeFileSync('src/App.tsx', code);
} else {
  console.log("Could not find hooks to move");
}
