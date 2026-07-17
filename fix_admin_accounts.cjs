const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to fetch users
const stateCode = `  const [usersList, setUsersList] = useState<any[]>([]);
  
  React.useEffect(() => {
    if (userRole === 'admin' && showAddAccountModal) {
      import('firebase/firestore').then(({ collection, getDocs }) => {
        getDocs(collection(db, 'users')).then(snapshot => {
          const list: any[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setUsersList(list);
        });
      });
    }
  }, [userRole, showAddAccountModal]);

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', id));
        setUsersList(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa tài khoản');
      }
    }
  };
`;

code = code.replace(
  "const [newAccSuccess, setNewAccSuccess] = useState('');",
  "const [newAccSuccess, setNewAccSuccess] = useState('');\n" + stateCode
);

const userListUI = `
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-4">Danh sách tài khoản</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {usersList.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-semibold text-sm text-slate-700">{u.email}</p>
                        <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                      </div>
                      <button onClick={() => handleDeleteAccount(u.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {usersList.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Đang tải...</p>}
                </div>
              </div>
`;

code = code.replace(
  /<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
  `</button>\n${userListUI}\n              </div>\n            </div>\n          </div>\n        </div>\n      )}`
);

code = code.replace("Thêm tài khoản", "Quản lý tài khoản");
code = code.replace("Thêm tài khoản", "Quản lý tài khoản");
code = code.replace("Thêm tài khoản", "Quản lý tài khoản");

fs.writeFileSync('src/App.tsx', code);
