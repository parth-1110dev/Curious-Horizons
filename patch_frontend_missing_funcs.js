const fs = require('fs');

const oldCode = fs.readFileSync('old_session_utf8.js', 'utf8');
const newCode = fs.readFileSync('frontend/session.js', 'utf8');

const startMarker = 'function createMarkdownBlock';
const endMarker = 'function flushTable(fragment, rendererState) {';

const oldStartIdx = oldCode.indexOf(startMarker);
const oldEndIdx = oldCode.indexOf(endMarker);

if (oldStartIdx === -1 || oldEndIdx === -1) {
    console.error("Could not find boundaries in old code");
    process.exit(1);
}

const missingBlock = oldCode.substring(oldStartIdx, oldEndIdx);

const insertIdx = newCode.indexOf(endMarker);
if (insertIdx === -1) {
    console.error("Could not find insertion point in new code");
    process.exit(1);
}

const finalCode = newCode.substring(0, insertIdx) + missingBlock + newCode.substring(insertIdx);

fs.writeFileSync('frontend/session.js', finalCode);
console.log("Successfully injected missing functions into frontend/session.js");
