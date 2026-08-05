const fs = require('fs');
let code = fs.readFileSync('frontend/session.js', 'utf8');

const target = `  try {
    const payload = {
      topic,
      duration: minutes,
      plan,
    };

    if (explanationMode) {
      payload.explanation_mode = explanationMode;
    }

    const response = await window.fetch(\`\${API_BASE}/generate\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));`;

const replacement = `  try {
    console.log("[Phase 1] 1. User clicked Start Session / init fetchAiSessionContent");
    const payload = {
      topic,
      duration: minutes,
      plan,
    };

    if (explanationMode) {
      payload.explanation_mode = explanationMode;
    }
    console.log("[Phase 1] 3. Request payload created:", payload);

    console.log("[Phase 1] 4. API request dispatched to:", \`\${API_BASE}/generate\`);
    const response = await window.fetch(\`\${API_BASE}/generate\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[Phase 1] 10. Response returned to frontend. Status:", response.status);

    console.log("[Phase 1] 11. Frontend receives response. Attempting to parse JSON...");
    const data = await response.json().catch((e) => {
      console.error("[Phase 1] 12. JSON parsing failed!", e);
      return {};
    });
    console.log("[Phase 1] 12. JSON parsing complete. Data:", data);`;

if (!code.includes(target)) {
    console.log("Could not find target string.");
    process.exit(1);
}

code = code.replace(target, replacement);

const target2 = `  } catch (_error) {
    renderSessionPlainText("Something went wrong. Please try again.", {
      textAlign: "center",
    });
  } finally {`;

const replacement2 = `  } catch (_error) {
    console.error("[Phase 1] Exception caught during session generation:", _error);
    renderSessionPlainText("Something went wrong. Please try again.", {
      textAlign: "center",
    });
  } finally {`;

code = code.replace(target2, replacement2);

fs.writeFileSync('frontend/session.js', code);
console.log("Patched session.js");
