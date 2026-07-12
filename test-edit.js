const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

// The error might be somewhere in how students are saved or rendered
// Can we find any undefined or missing properties?

console.log("Students state shape?");
