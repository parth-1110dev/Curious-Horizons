const fs = require('fs');

const oldCode = fs.readFileSync('old_session_utf8.js', 'utf8');
const newCode = fs.readFileSync('frontend/session.js', 'utf8');

const startMarker = 'function createMarkdownBlock';
const endMarker = 'function isMathTokenLine(trimmedLine) {';

const startIdx = oldCode.indexOf(startMarker);
const endIdx = oldCode.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find markers in old_session_utf8.js");
  process.exit(1);
}

const missingBlock = oldCode.substring(startIdx, endIdx);

const insertIdx = newCode.indexOf(endMarker);
if (insertIdx === -1) {
  console.error("Could not find insertion point (isMathTokenLine) in frontend/session.js");
  process.exit(1);
}

const finalCode = newCode.substring(0, insertIdx) + missingBlock + newCode.substring(insertIdx);

fs.writeFileSync('frontend/session.js', finalCode);
console.log("Successfully injected missing functions without duplicating isMathTokenLine!");
