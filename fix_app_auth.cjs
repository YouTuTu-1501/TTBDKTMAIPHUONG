const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add Firebase Auth imports
if (!code.includes("import { onAuthStateChanged, createUserWithEmailAndPassword }")) {
  code = code.replace(
    "import { db } from './lib/firebase';",
    "import { db, auth, secondaryAuth } from './lib/firebase';\nimport { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';\nimport Login from './components/Login';"
  );
}

// Add state for currentUser, loadingAuth, and new account form
code = code.replace(
  "export default function App() {\n  const [activeTab",
  `export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccRole, setNewAccRole] = useState<UserRole>('teacher');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccError, setNewAccError] = useState('');
  const [newAccSuccess, setNewAccSuccess] = useState('');

  const [activeTab`
);

// Add useEffect for onAuthStateChanged
const useEffectAuth = `
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole);
          } else {
            // Default role if not found
            setUserRole('student');
          }
          setCurrentUser(user);
        } catch (err) {
          console.error("Error fetching user role:", err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);
`;

// Insert the new useEffect before the existing one
code = code.replace("React.useEffect(() => {\n    const fetchData", useEffectAuth + "\n  React.useEffect(() => {\n    const fetchData");

// Only fetch data if currentUser exists (optional, but let's do it)
code = code.replace(
  "React.useEffect(() => {\n    const fetchData = async () => {\n      try {\n        const docSnap = await getDoc(doc(db, 'appData', 'main'));",
  "React.useEffect(() => {\n    if (!currentUser) return;\n    const fetchData = async () => {\n      try {\n        const docSnap = await getDoc(doc(db, 'appData', 'main'));"
);

// Handle account creation logic
const handleCreateAccount = `
  const handleCreateAccount = async () => {
    if (!newAccEmail || !newAccPassword) return;
    setCreatingAccount(true);
    setNewAccError('');
    setNewAccSuccess('');
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAccEmail, newAccPassword);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newAccEmail,
        role: newAccRole,
        createdAt: new Date().toISOString()
      });
      setNewAccSuccess('Tạo tài khoản thành công!');
      setNewAccEmail('');
      setNewAccPassword('');
      setTimeout(() => {
        setShowAddAccountModal(false);
        setNewAccSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setNewAccError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setCreatingAccount(false);
    }
  };
`;

code = code.replace("const handleAddStudent =", handleCreateAccount + "\n  const handleAddStudent =");

// Replace the mock add account modal with a real one
code = code.replace(
  /<div className="fixed inset-0 bg-slate-900\/40[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
  `{showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">Thêm tài khoản</h3>
                <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-slate-600">
                  X
                </button>
              </div>
              <p className="text-slate-500 text-sm mb-4">Nhập thông tin tài khoản mới vào hệ thống.</p>
              
              {newAccError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{newAccError}</div>}
              {newAccSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100">{newAccSuccess}</div>}
              
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={newAccEmail} onChange={(e) => setNewAccEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="VD: gv_anh@school.edu.vn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <input type="password" value={newAccPassword} onChange={(e) => setNewAccPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="********" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phân quyền</label>
                  <select value={newAccRole} onChange={(e) => setNewAccRole(e.target.value as UserRole)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <option value="teacher">Giáo viên</option>
                    <option value="student">Học viên</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-70 mt-4"
                >
                  {creatingAccount ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`
);

// We should also replace the top role selector since it is now real Auth
code = code.replace(
  /<select\s*value=\{userRole\}[\s\S]*?<\/select>/,
  `<button onClick={() => auth.signOut()} className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors mt-0.5">Đăng xuất</button>`
);

// If loading or not logged in, return Login component
// Let's add this at the very beginning of the return statement
code = code.replace(
  "return (",
  `if (loadingAuth) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }
  if (!currentUser) {
    return <Login />;
  }
  return (`
);


fs.writeFileSync('src/App.tsx', code);
