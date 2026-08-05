const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');

// Create mock DOM
const dom = new JSDOM(
  '<div id="sessionContent"></div>' +
  '<div id="timerDisplay"></div>' +
  '<button class="star-btn" data-value="1"></button>' +
  '<button id="exitBtn"></button>'
);

const sandbox = {
  window: dom.window,
  document: dom.window.document,
  console: console,
  sessionContentEl: dom.window.document.getElementById("sessionContent"),
  API_BASE: "http://127.0.0.1:8000",
  timerDisplayEl: dom.window.document.getElementById("timerDisplay"),
  starButtons: dom.window.document.querySelectorAll(".star-btn"),
  exitBtn: dom.window.document.getElementById("exitBtn"),
  homeBtn: null,
  startNewBtn: null,
  continueBtn: null,
  generateNotesBtn: null,
  knowledgePackModal: null,
  Date: Date,
  Math: Math,
  String: String,
  Number: Number,
  Map: Map,
  JSON: JSON,
  Promise: Promise,
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  URLSearchParams: dom.window.URLSearchParams
};

sandbox.window.performance = { now: () => Date.now() };
sandbox.window.requestAnimationFrame = (cb) => { cb(); return 1; };
sandbox.window.localStorage = { getItem: () => "free", setItem: () => {} };
sandbox.window.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({ content: "## Hello World\\nThis is a mock response.\\n1. Item 1\\n2. Item 2\\n\\nMath: $x = 2$" })
});
sandbox.getUserPlan = () => "free";
sandbox.getPlanSessionMinutes = () => 10;
sandbox.getPlanMaxMinutes = () => 10;
sandbox.STORAGE_TOPIC_KEY = "topic";
sandbox.STORAGE_MINUTES_KEY = "min";
sandbox.STORAGE_EXPLANATION_TOPIC_KEY = "exp";
sandbox.STORAGE_EXPLANATION_MODE_KEY = "exp_mode";
sandbox.incrementFreeSessionsUsedToday = () => {};
sandbox.logSessionPerformance = () => {};
sandbox.initInteractions = () => {};
sandbox.STORAGE_SESSION_CONTENT_KEY = "content";
sandbox.clearTimerIntervals = () => {};
sandbox.renderSessionPlainText = (msg) => { console.log("RENDERED PLAIN TEXT:", msg); };

vm.createContext(sandbox);

let code = fs.readFileSync('frontend/session.js', 'utf8');
// Remove static imports at the top
code = code.replace(/import\s+.*?from\s+['"].*?['"];\r?\n/g, ''); 
code = code.replace(/document\.addEventListener\("DOMContentLoaded"[\s\S]*?\);/s, ''); 
// Replace dynamic import
code = code.replace(/await import\([^)]+\)/g, 'null');

try {
  vm.runInContext(code, sandbox);
  
  // Now call fetchAiSessionContent
  console.log("--- Starting Test ---");
  vm.runInContext("fetchAiSessionContent('Physics', 10, 'free', '').catch(console.error);", sandbox);
  
  // Wait a tick for promises
  setTimeout(() => {
    console.log("--- End Test ---");
  }, 1000);
} catch (e) {
  console.error("EVAL ERROR:", e);
}
