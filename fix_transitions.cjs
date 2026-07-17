const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { motion, AnimatePresence }")) {
    code = code.replace(
        "import React, { useState, useRef } from 'react';",
        "import React, { useState, useRef } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';"
    );
}

const oldTabsStr = `{activeTab === 'dashboard' && <Dashboard students={filteredStudentsBySubject} classTests={classTests} />}
            {activeTab === 'classes' && <ClassManagement userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
            {activeTab === 'attendance' && <Attendance userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} sendSimulatedEmail={sendSimulatedEmail} />}
            {activeTab === 'academics' && <Academics userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} sendSimulatedEmail={sendSimulatedEmail} />}
            {activeTab === 'grades' && <Grades userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} classTests={classTests} setClassTests={setClassTests} />}
            {activeTab === 'schedule' && <Schedule userRole={userRole} />}`;

const newTabsStr = `<AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && <Dashboard students={filteredStudentsBySubject} classTests={classTests} />}
                {activeTab === 'classes' && <ClassManagement userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} />}
                {activeTab === 'attendance' && <Attendance userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} sendSimulatedEmail={sendSimulatedEmail} />}
                {activeTab === 'academics' && <Academics userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} sendSimulatedEmail={sendSimulatedEmail} />}
                {activeTab === 'grades' && <Grades userRole={userRole} students={filteredStudentsBySubject} setStudents={setStudents} selectedClass={selectedClassFilter} searchQuery={searchQuery} classTests={classTests} setClassTests={setClassTests} />}
                {activeTab === 'schedule' && <Schedule userRole={userRole} />}
              </motion.div>
            </AnimatePresence>`;

code = code.replace(oldTabsStr, newTabsStr);

// To avoid duplicate animation effects, we can remove the 'animate-in fade-in slide-in-from-bottom-4 duration-500' 
// from the main wrapper of those components.
code = code.replace(/animate-in fade-in slide-in-from-bottom-4 duration-500/g, "");

fs.writeFileSync('src/App.tsx', code);
