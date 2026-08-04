const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add pendingStudentToAdd state to ClassManagement
const cmStateTarget = "const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);";
const cmStateReplacement = "const [pendingStudentToAdd, setPendingStudentToAdd] = useState<Student | null>(null);\n  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);";
code = code.replace(cmStateTarget, cmStateReplacement);

// 2. Update handleAddStudent and add confirmAddStudent
const oldHandleAdd = `  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    
    if (!name.trim()) return;

    const newStudent: Student = {
      id: \`ST\${String(Date.now()).slice(-4)}\`,
      name: name.trim(),
      dob: dob.trim(),
      subject,
      classRoom: targetClass,
      email: email.trim() || undefined,
      present: false, // Mặc định chưa điểm danh
      tags: []
    };

    setStudents(prev => [...prev, newStudent]);
    setName(''); // Reset form
    setDob('');
    setClassRoom('');
    setEmail('');
  };`;

const newHandleAdd = `  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    
    if (!name.trim()) return;

    const newStudent: Student = {
      id: \`ST\${String(Date.now()).slice(-4)}\`,
      name: name.trim(),
      dob: dob.trim(),
      subject,
      classRoom: targetClass,
      email: email.trim() || undefined,
      present: false, // Mặc định chưa điểm danh
      tags: []
    };

    setPendingStudentToAdd(newStudent);
  };

  const confirmAddStudent = () => {
    if (!pendingStudentToAdd) return;
    setStudents(prev => [...prev, pendingStudentToAdd]);
    setPendingStudentToAdd(null);
    setName('');
    setDob('');
    setClassRoom('');
    setEmail('');
  };`;

code = code.replace(oldHandleAdd, newHandleAdd);

// 3. Add Add Student Confirm Modal before Delete Student Confirm Modal
const oldDeleteModalTag = "{/* Delete Student Confirm Modal */}";
const newAddModalTag = `{/* Add Student Confirm Modal */}
      {pendingStudentToAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Xác nhận thêm học sinh</h3>
              <p className="text-slate-500 text-sm text-center mb-4">
                Bạn có chắc chắn muốn thêm học sinh mới vào hệ thống?
              </p>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm text-slate-700 border border-slate-100">
                <div><span className="font-semibold text-slate-500">Họ và tên:</span> <span className="font-bold text-slate-800">{pendingStudentToAdd.name}</span></div>
                <div><span className="font-semibold text-slate-500">Ngày sinh:</span> {formatDob(pendingStudentToAdd.dob)}</div>
                <div><span className="font-semibold text-slate-500">Lớp:</span> {pendingStudentToAdd.classRoom}</div>
                <div><span className="font-semibold text-slate-500">Môn học:</span> {pendingStudentToAdd.subject}</div>
                {pendingStudentToAdd.email && (
                  <div><span className="font-semibold text-slate-500">Email:</span> {pendingStudentToAdd.email}</div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingStudentToAdd(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/50 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmAddStudent}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors shadow-sm shadow-indigo-600/20"
              >
                Xác nhận thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirm Modal */}`;

code = code.replace(oldDeleteModalTag, newAddModalTag);

// 4. Update Academics component for tuition toggle confirmation
const tuitionStateTarget = "const [selectedUnpaidMonth, setSelectedUnpaidMonth] = useState<string>(currentMonthStr);";
const tuitionStateReplacement = `const [tuitionToConfirm, setTuitionToConfirm] = useState<{
    studentId: string;
    studentName: string;
    month: string;
    method: 'cash' | 'transfer';
    isUnchecking: boolean;
  } | null>(null);

  const onRequestToggleTuition = (student: Student, month: string, method: 'cash' | 'transfer') => {
    if (userRole === 'student') return;
    const currentTuition = student.tuition || {};
    const currentMonthData = currentTuition[month];
    const isUnchecking = currentMonthData?.method === method;

    setTuitionToConfirm({
      studentId: student.id,
      studentName: student.name,
      month,
      method,
      isUnchecking
    });
  };

  const confirmToggleTuition = () => {
    if (!tuitionToConfirm) return;
    const { studentId, month, method } = tuitionToConfirm;

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const currentTuition = s.tuition || {};
        const currentMonthData = currentTuition[month];
        
        let newMonthData;
        if (currentMonthData?.method === method) {
          newMonthData = undefined;
        } else {
          const today = new Date().toISOString().split('T')[0];
          newMonthData = { method, date: today };
        }

        return {
          ...s,
          tuition: {
            ...currentTuition,
            [month]: newMonthData as any
          }
        };
      }
      return s;
    }));

    setTuitionToConfirm(null);
  };

  const [selectedUnpaidMonth, setSelectedUnpaidMonth] = useState<string>(currentMonthStr);`;

code = code.replace(tuitionStateTarget, tuitionStateReplacement);

// Replace checkbox click calls in Academics
code = code.replace("onChange={() => handleToggleTuition(student.id, m, 'cash')}", "onChange={() => onRequestToggleTuition(student, m, 'cash')}");
code = code.replace("onChange={() => handleToggleTuition(student.id, m, 'transfer')}", "onChange={() => onRequestToggleTuition(student, m, 'transfer')}");

// Add Tuition Confirm Modal before end of Academics return
const academicsEndTarget = `        </section>
      </div>
    </div>
  );
}`;

const tuitionModal = `        </section>
      </div>

      {/* Confirmation Modal for Tuition Toggle */}
      {tuitionToConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 \${tuitionToConfirm.isUnchecking ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}\`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {tuitionToConfirm.isUnchecking ? 'Xác nhận hủy đóng học phí' : 'Xác nhận đóng học phí'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {tuitionToConfirm.isUnchecking ? (
                  <>Bạn có chắc chắn muốn <span className="font-bold text-amber-600">bỏ tích</span> đóng học phí tháng <span className="font-bold text-slate-800">{tuitionToConfirm.month}</span> của học sinh <span className="font-bold text-slate-800">{tuitionToConfirm.studentName}</span>?</>
                ) : (
                  <>Xác nhận học sinh <span className="font-bold text-slate-800">{tuitionToConfirm.studentName}</span> đã đóng học phí tháng <span className="font-bold text-slate-800">{tuitionToConfirm.month}</span> qua hình thức <span className="font-bold text-emerald-600">{tuitionToConfirm.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>?</>
                )}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
              <button
                onClick={() => setTuitionToConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/50 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmToggleTuition}
                className={\`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors shadow-sm \${tuitionToConfirm.isUnchecking ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}\`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(academicsEndTarget, tuitionModal);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched confirmation modals successfully");
