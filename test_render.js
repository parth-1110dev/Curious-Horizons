const fs = require('fs');

let sessionJs = fs.readFileSync('./frontend/session.js', 'utf8');
// Remove all imports
sessionJs = sessionJs.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?$/gm, '');
// For multi-line imports that might not match perfectly:
sessionJs = sessionJs.replace(/import\s*\{[^}]*\}\s*from\s*['"].*?['"];?/g, '');

const dom = `
  <div id="sessionContent"></div>
  <div id="timerDisplay"></div>
  <div id="sessionScreen"></div>
  <div id="completeScreen"></div>
`;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(dom, { url: "http://localhost/" });

const sandbox = {
  window,
  document: window.document,
  console,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  setInterval: window.setInterval,
  clearInterval: window.clearInterval,
  requestAnimationFrame: (cb) => cb(),
  cancelAnimationFrame: () => {},
  performance: { now: () => 0 },
  localStorage: { getItem: () => "Test", setItem: () => {}, removeItem: () => {} },
  Math,
  Number,
  String,
  Map,
  Array,
  Object,
  Date
};

sandbox.window.katex = {
  renderToString: (latex) => `<katex>${latex}</katex>`
};

sandbox.window.performance = sandbox.performance;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.matchMedia = () => ({ matches: false });

sandbox.getUserPlan = () => "free";
sandbox.initInteractions = () => {};

try {
  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(sessionJs, sandbox);
  
  const markdown = "## Test Heading\\nHere is some text.\\n\\n- Item 1\\n- Item 2";
  sandbox.renderSessionMarkdown(markdown);
  
  const html = sandbox.document.getElementById('sessionContent').innerHTML;
  console.log("RENDERED HTML:");
  console.log(html.trim());
  if (html.includes("<h2>Test Heading</h2>")) {
    console.log("SUCCESS");
  } else {
    console.log("FAILED to find rendered heading");
  }
} catch (e) {
  console.error("ERROR:", e);
}
