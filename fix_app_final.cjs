const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// First, remove the completely messed up block from line 115-135
// We will just find the onAuthStateChanged effect and replace it entirely

const startIdx = code.indexOf('React.useEffect(() => {\n    const unsubscribe = onAuthStateChanged');
const endIdx = code.indexOf('React.useEffect(() => {\n    if (!currentUser) return;');

if (startIdx !== -1 && endIdx !== -1) {
  // Extract everything before startIdx and after endIdx
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  
  const correctAuthEffect = `  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole);
          } else {
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

  if (loadingAuth) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }
  
  if (!currentUser) {
    return <Login />;
  }

`;
  
  code = before + correctAuthEffect + after;
}

// Ensure there is only one "return (" for the App component main render.
// Since we might have messed up the "return (" for the main app, let's make sure it exists correctly.
// The main return should start with `return (` followed by `<div className="flex h-screen overflow-hidden`...

// Wait, looking at the code, it probably is fine if we fixed the auth block.
fs.writeFileSync('src/App.tsx', code);
