const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace in headers
code = code.replace(
  'sticky left-[192px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-28 text-center',
  'md:sticky md:left-[192px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-28 text-center'
);

code = code.replace(
  'sticky left-[304px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-24 text-center',
  'md:sticky md:left-[304px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-24 text-center'
);

code = code.replace(
  'sticky left-[400px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left',
  'md:sticky md:left-[400px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left'
);

code = code.replace(
  'sticky left-[192px] bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left',
  'md:sticky md:left-[192px] bg-white md:z-20 shadow-[2px_0_4px_rgba(0,0,0,0.02)] w-48 text-left'
);

// Replace in body
code = code.replace(
  'sticky left-[192px] z-10',
  'md:sticky md:left-[192px] md:z-10'
);

code = code.replace(
  'sticky left-[304px] z-10',
  'md:sticky md:left-[304px] md:z-10'
);

code = code.replace(
  'sticky left-[400px] z-10',
  'md:sticky md:left-[400px] md:z-10'
);

code = code.replace(
  'sticky left-[192px] z-10',
  'md:sticky md:left-[192px] md:z-10'
);

fs.writeFileSync('src/App.tsx', code);
