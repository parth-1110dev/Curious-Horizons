const fs = require('fs');

let code = fs.readFileSync('frontend/session.js', 'utf8');

// Instrument fetchAiSessionContent
const target1 = `  try {
    const payload = {`;

const repl1 = `  try {
    console.log("[Session] Start button clicked");
    console.log("[Frontend][ENTRY] fetchAiSessionContent initiated");
    const payload = {`;
code = code.replace(target1, repl1);

const target2 = `    if (explanationMode) {
      payload.explanation_mode = explanationMode;
    }

    const response = await window.fetch(\`\${API_BASE}/generate\`, {`;

const repl2 = `    if (explanationMode) {
      payload.explanation_mode = explanationMode;
    }
    console.log("[Session] Payload built");
    console.log("[Frontend][SUCCESS] Payload built, sending fetch to:", API_BASE);
    console.log("[Session] Request sent");
    const response = await window.fetch(\`\${API_BASE}/generate\`, {`;
code = code.replace(target2, repl2);

const target3 = `    const data = await response.json().catch(() => ({}));`;

const repl3 = `    console.log("[Frontend][SUCCESS] Response received with status:", response.status);
    console.log("[Frontend] Response received");
    const data = await response.json().catch((e) => {
      console.error("[Frontend][FAILURE] JSON parsing failed", e);
      return {};
    });
    console.log("[Frontend][SUCCESS] JSON parsed");`;
code = code.replace(target3, repl3);

const target4 = `    renderSessionMarkdown(content, { startedAt: requestStartedAt });
  } catch (_error) {`;

const repl4 = `    console.log("[Frontend][ENTRY] renderSessionMarkdown initiated");
    try {
      renderSessionMarkdown(content, { startedAt: requestStartedAt });
      console.log("[Frontend][EXIT] DOM rendered successfully");
      console.log("[Frontend] Session rendered");
    } catch (e) {
      console.error("[Frontend][FAILURE] Rendering crashed:", e);
      throw e;
    }
  } catch (_error) {
    console.error("[Frontend][FAILURE] Exception caught in fetchAiSessionContent:", _error);`;
code = code.replace(target4, repl4);

fs.writeFileSync('frontend/session.js', code);
console.log("Instrumented frontend");
