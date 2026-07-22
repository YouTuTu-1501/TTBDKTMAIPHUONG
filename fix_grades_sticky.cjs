const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'sticky left-0 bg-white z-10 w-16',
  'md:sticky md:left-0 bg-white md:z-10 w-16'
);

code = code.replace(
  'sticky left-[64px] bg-white z-10 w-48',
  'sticky left-0 md:left-[64px] bg-white z-10 w-48'
);

code = code.replace(
  'sticky left-0 bg-white group-hover:bg-slate-50/80 z-10',
  'md:sticky md:left-0 bg-white group-hover:bg-slate-50/80 md:z-10'
);

code = code.replace(
  'sticky left-[64px] z-10',
  'sticky left-0 md:left-[64px] z-10'
);

fs.writeFileSync('src/App.tsx', code);
