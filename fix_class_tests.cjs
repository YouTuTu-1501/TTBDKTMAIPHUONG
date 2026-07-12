const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "if (data.classTests) setClassTests(data.classTests);",
  `if (data.classTests) {
            const normalizedClassTests: Record<string, string[]> = {};
            for (const [key, value] of Object.entries(data.classTests)) {
              const normKey = String(key || '').trim().replace(/\\s+/g, ' ') || 'Chưa xếp lớp';
              if (normalizedClassTests[normKey]) {
                normalizedClassTests[normKey] = Array.from(new Set([...normalizedClassTests[normKey], ...(value as string[])]));
              } else {
                normalizedClassTests[normKey] = value as string[];
              }
            }
            setClassTests(normalizedClassTests);
          }`
);

fs.writeFileSync('src/App.tsx', code);
