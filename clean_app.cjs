const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the duplicated {showAddAccountModal && (
code = code.replace(/\{showAddAccountModal && \(\s*\{showAddAccountModal && \(\s*\{showAddAccountModal && \(/g, '{showAddAccountModal && (');

// Remove the duplicated handleCreateAccount
const handleCreateAccRegex = /\s*const handleCreateAccount = async \(\) => \{[\s\S]*?\}\s*;\s*const handleAddStudent =/g;
const matches = code.match(handleCreateAccRegex);
if (matches && matches.length > 0) {
    code = code.replace(handleCreateAccRegex, '\n  const handleAddStudent =');
}

// Now insert handleCreateAccount ONLY inside the App component, right before return (
const handleCreateAccountFunc = `
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

code = code.replace(
  /if \(loadingAuth\) \{/,
  handleCreateAccountFunc + '\n  if (loadingAuth) {'
);

fs.writeFileSync('src/App.tsx', code);
