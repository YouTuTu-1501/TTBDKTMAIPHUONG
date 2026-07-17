const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add email state for new and edit
code = code.replace(
  "const [classRoom, setClassRoom] = useState('');",
  "const [classRoom, setClassRoom] = useState('');\n  const [email, setEmail] = useState('');"
);

code = code.replace(
  "const [editClassRoom, setEditClassRoom] = useState('');",
  "const [editClassRoom, setEditClassRoom] = useState('');\n  const [editEmail, setEditEmail] = useState('');"
);

// 2. Add email to newStudent
code = code.replace(
  "classRoom: targetClass,",
  "classRoom: targetClass,\n      email: email.trim() || undefined,"
);

// 3. Reset email in handleAddStudent
code = code.replace(
  "setClassRoom('');\n  };",
  "setClassRoom('');\n    setEmail('');\n  };"
);

// 4. Set editEmail when editing
code = code.replace(
  "setEditClassRoom(student.classRoom || '');",
  "setEditClassRoom(student.classRoom || '');\n    setEditEmail(student.email || '');"
);

// 5. Save editEmail
code = code.replace(
  "classRoom: editClassRoom.trim()",
  "classRoom: editClassRoom.trim(),\n          email: editEmail.trim() || undefined"
);

// 6. Add email to add student UI
const newEmailInput = `
            <div className="w-full md:w-48 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email học sinh</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@... (để đăng nhập)"
                className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
`;
code = code.replace(
  /<\/div>\s*<div className="flex gap-4 w-full md:w-auto">\s*<div className="flex-1 md:w-40 space-y-2">\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ngày sinh<\/label>/,
  `</div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="w-full md:w-48 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email học sinh</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Dùng để đăng nhập"
                className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex-1 md:w-40 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ngày sinh</label>`
);

// 7. Add email to edit student UI
const editEmailInput = `
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border-slate-200 border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-700 transition-all"
                  placeholder="Dùng để đăng nhập"
                />
              </div>
`;

code = code.replace(
  /<div className="space-y-2">\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Lớp<\/label>\s*<input \s*type="text" \s*value=\{editClassRoom\}/,
  `${editEmailInput}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Lớp</label>
                <input 
                  type="text" 
                  value={editClassRoom}`
);

fs.writeFileSync('src/App.tsx', code);
