const fs = require('fs');

let sessionJs = fs.readFileSync('frontend/session.js', 'utf8');

// 1. Remove imports
sessionJs = sessionJs.replace(/import\s+\{\s*renderMarkdown\s*\}\s*from\s*["'].\/js\/ui\/markdown\.js["'];\r?\n/, '');
sessionJs = sessionJs.replace(/import\s+\{\s*fetchStream\s*\}\s*from\s*["'].\/js\/ui\/streamReader\.js["'];\r?\n/, '');
sessionJs = sessionJs.replace(/import\s+\{\s*StreamRenderer\s*\}\s*from\s*["'].\/js\/ui\/streamRenderer\.js["'];\r?\n/, '');

// 2. Replace renderer
const rsmRegex = /(?:\/\/\s*\(Replaced by progressive renderer[^\n]*\r?\n)?function renderSessionMarkdown[\s\S]*?(?=function renderSessionPlainText)/;
const parserCode = fs.readFileSync('parser_functions.js', 'utf8');
const rsmCode = fs.readFileSync('render_session.js', 'utf8');

if (!rsmRegex.test(sessionJs)) {
  console.error("Could not find renderSessionMarkdown block");
  process.exit(1);
}
sessionJs = sessionJs.replace(rsmRegex, parserCode + '\n' + rsmCode + '\n\n');

// 3. Replace fetchAiSessionContent
const fetchRegex = /let generateRequestInFlight\s*=\s*false;\r?\n\r?\nasync function fetchAiSessionContent[\s\S]*?(?=\/\/\s*Init:\s*read saved topic\/time)/;
const fetchCode = fs.readFileSync('fetch_session.js', 'utf8');

if (!fetchRegex.test(sessionJs)) {
  console.error("Could not find fetchAiSessionContent block");
  process.exit(1);
}
sessionJs = sessionJs.replace(fetchRegex, 'let generateRequestInFlight = false;\n\n' + fetchCode + '\n');

fs.writeFileSync('frontend/session.js', sessionJs, 'utf8');
console.log("Successfully patched frontend/session.js");
