console.log("KNOWLEDGE PACK JS LOADED");
import { initInteractions } from "./js/animations/interactions.js";
import {
  initKnowledgePackReveal,
  triggerArchiveCompletion,
  triggerDiscoveryRipple,
  triggerSuccessAnimation,
} from "./js/animations/effects.js";
import { showToast } from "./js/ui/toast.js";

const STORAGE_TOPIC_KEY = "lockedin_selected_topic";
const STORAGE_SESSION_CONTENT_KEY = "lockedin_session_content";

const PDF_JSPDF_SRC = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
const PDF_HTML2CANVAS_SRC =
  "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

const _host = window.location.hostname;
const API_BASE =
  !window.location.hostname ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://curious-horizons.onrender.com";

const formatButtons = document.querySelectorAll(".format-btn");
const examModeToggle = document.getElementById("examModeToggle");
const examModeDropdown = document.getElementById("examModeDropdown");
const downloadNotesBtn = document.getElementById("downloadNotesBtn");
const copyNotesBtn = document.getElementById("copyNotesBtn");
const backBtn = document.getElementById("kpBackBtn");
const loadingState = document.getElementById("kpLoadingState");
const contentState = document.getElementById("kpContent");

const KP_PERF_LOG_ENABLED = (() => {
  try {
    const debugFlag = window.localStorage.getItem("lockedin_perf_debug");
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      debugFlag === "1"
    );
  } catch (_error) {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }
})();

function logKnowledgePackPerformance(label, details) {
  if (!KP_PERF_LOG_ENABLED || typeof console === "undefined") return;
  if (typeof console.debug === "function") {
    console.debug("[KnowledgePackPerf]", label, details);
    return;
  }
  console.log("[KnowledgePackPerf]", label, details);
}

let selectedFormat = null;
let generatedNotes = "";
let isGenerating = false;
let isDownloading = false;

function normalizePlan(plan) {
  const normalized = String(plan || "").trim().toLowerCase();
  if (normalized === "pro" || normalized === "elite" || normalized === "free") return normalized;
  return "free";
}

function getCurrentPlan() {
  const planState = window.LockedInPlanState;
  if (planState && typeof planState.getCurrentActivePlan === "function") {
    return normalizePlan(planState.getCurrentActivePlan());
  }

  return "free";
}

function getUserPlan() {
  return getCurrentPlan();
}

function selectFormat(format) {
  selectedFormat = format;

  formatButtons.forEach((btn) => {
    const btnFormat = btn.getAttribute("data-format");
    const isSelected = btnFormat === selectedFormat;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });
}

function toggleExamModeDropdown() {
  if (!examModeToggle || !examModeDropdown) return;
  const isExpanded = examModeToggle.getAttribute("aria-expanded") === "true";
  const nextExpanded = !isExpanded;

  examModeToggle.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
  examModeDropdown.classList.toggle("is-open", nextExpanded);
  examModeDropdown.setAttribute("aria-hidden", nextExpanded ? "false" : "true");
}

function closeExamModeDropdown() {
  if (!examModeToggle || !examModeDropdown) return;
  examModeToggle.setAttribute("aria-expanded", "false");
  examModeDropdown.classList.remove("is-open");
  examModeDropdown.setAttribute("aria-hidden", "true");
}

function setupFormatButtons() {
  formatButtons.forEach((btn) => {
    const btnFormat = btn.getAttribute("data-format");
    if (!btnFormat) return;

    btn.addEventListener("click", () => {
      selectFormat(btnFormat);
      if (btnFormat === "exam") {
        toggleExamModeDropdown();
        return;
      }

      closeExamModeDropdown();
    });
  });
}

function getSafeTopicSlug() {
  const topic = window.localStorage.getItem(STORAGE_TOPIC_KEY) || "notes";
  const sanitized = String(topic)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return sanitized || "notes";
}

function normalizeContentOrNull() {
  const text = typeof generatedNotes === "string" ? generatedNotes.trim() : "";
  return text.length > 0 ? text : null;
}



function downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}




function showLoadingState() {
  loadingState.removeAttribute("hidden");
  contentState.setAttribute("hidden", "");
}

function showContentState() {
  loadingState.setAttribute("hidden", "");
  contentState.removeAttribute("hidden");

  // Part 5 — Knowledge Pack Reveal: staggered progressive reveal
  requestAnimationFrame(() => {
    initKnowledgePackReveal();
    triggerDiscoveryRipple(contentState);
  });
}

async function generateKnowledgePack() {
  if (isGenerating) return;
  isGenerating = true;
  generatedNotes = "";
  const generationStartedAt = window.performance.now();



  try {
    showLoadingState();
    const topic = window.localStorage.getItem(STORAGE_TOPIC_KEY) || "Unknown Topic";
    const sessionContent = window.localStorage.getItem(STORAGE_SESSION_CONTENT_KEY) || "";
    const plan = getUserPlan();
    const effectiveFormat = selectedFormat || "exam";

    const response = await window.fetch(`${API_BASE}/generate-knowledge-pack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        content: sessionContent,
        format: effectiveFormat,
        plan,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.error) {
      showToast(data.error || "We couldn't generate your notes. Please try again.", 'error');
      showContentState();
      return;
    }

    generatedNotes = data.notes || "";
    window.localStorage.setItem(
      "lockedin_generated_notes",
      generatedNotes
    );
    showContentState();
    logKnowledgePackPerformance("notes generated", {
      plan,
      format: effectiveFormat,
      characters: generatedNotes.length,
      elapsedMs: Math.round(window.performance.now() - generationStartedAt),
    });
  } catch (error) {
    console.error("Error generating notes:", error);
    showToast("We couldn't generate your notes. Please try again.", 'error');
    showContentState();
  } finally {
    isGenerating = false;
  }
}

async function downloadNotes() {
  if (!downloadNotesBtn || isDownloading) return;

  isDownloading = true;
  downloadNotesBtn.disabled = true;

  let loadingUi = null;
  try {
    loadingUi = await import('./js/ui/loading.js');
  } catch (e) {
    console.warn("Failed to load loading UI", e);
  }

  try {
    const baseName = getSafeTopicSlug();
    const effectiveFormat = selectedFormat || "exam";
    const topicName = window.localStorage.getItem(STORAGE_TOPIC_KEY) || "Topic Name";
    const rawSession = window.localStorage.getItem(STORAGE_SESSION_CONTENT_KEY) || "";

    // ── PDF NOTES ──────────────────────────────────────────────────────────────
    // Send the raw, unmodified learning session directly to /generate-pdf.
    // No AI transformation. No summarization. The session IS the document.
    if (effectiveFormat === "pdf") {
      if (!rawSession) {
        showToast("No session content available. Please complete a learning session first.", 'info');
        return;
      }

      if (loadingUi) {
        loadingUi.showLoading({
          title: "Preparing your PDF",
          messages: [
            "Organizing your notes...",
            "Formatting document layout...",
            "Optimizing for readability...",
            "Preparing your download..."
          ]
        });
      }

      const response = await window.fetch(`${API_BASE}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: "PDF Notes",
          topic_name: topicName,
          content: rawSession
        })
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}-notes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    // ── EXAM CHEAT SHEET ───────────────────────────────────────────────────────
    // Pipeline: raw session → AI compression → /generate-pdf
    // The AI receives the complete session and transforms it into a revision doc.
    if (effectiveFormat === "exam") {
      if (!rawSession) {
        showToast("No session content available. Please complete a learning session first.", 'info');
        return;
      }

      if (loadingUi) {
        loadingUi.showLoading({
          title: "Preparing Exam Notes",
          messages: [
            "Selecting key concepts...",
            "Building your revision sheet...",
            "Optimizing for quick review...",
            "Preparing your download..."
          ]
        });
      }

      // Step 1: Transform the session into a cheat sheet via AI
      const packResponse = await window.fetch(`${API_BASE}/generate-knowledge-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicName,
          content: rawSession,
          format: "exam",
          plan: getUserPlan(),
        }),
      });

      const packData = await packResponse.json().catch(() => ({}));

      if (!packResponse.ok || packData.error) {
        showToast(packData.error || "Failed to generate Exam Cheat Sheet. Please try again.", 'error');
        return;
      }

      const cheatSheetContent = packData.notes || "";
      if (!cheatSheetContent) {
        showToast("No content was generated. Please try again.", 'error');
        return;
      }

      // Step 2: Convert the compressed cheat sheet into a PDF
      const pdfResponse = await window.fetch(`${API_BASE}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: "Exam Cheat Sheet",
          topic_name: topicName,
          content: cheatSheetContent
        })
      });

      if (!pdfResponse.ok) throw new Error("Failed to generate PDF");

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}-exam-cheat-sheet.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    // ── MARKDOWN ───────────────────────────────────────────────────────────────
    // ── MARKDOWN ───────────────────────────────────────────────────────────────
    if (effectiveFormat === "markdown") {
      if (!generatedNotes) {
        generatedNotes = window.localStorage.getItem("lockedin_generated_notes") || "";
      }
      const content = normalizeContentOrNull();
      if (!content) {
        showToast("No notes available yet. Please generate notes first.", 'info');
        return;
      }

      if (loadingUi) {
        loadingUi.showLoading({
          title: "Preparing Markdown",
          messages: [
            "Structuring content...",
            "Formatting Markdown...",
            "Finalizing your notes...",
            "Preparing your download..."
          ]
        });
      }

      downloadBlob(content, "text/markdown;charset=utf-8", `${baseName}-notes.md`);
      window.localStorage.removeItem("lockedin_generated_notes");
      return;
    }

    // Fallback plain text
    if (!generatedNotes) {
      generatedNotes = window.localStorage.getItem("lockedin_generated_notes") || "";
    }
    const content = normalizeContentOrNull();
    if (content) {
      if (loadingUi) {
        loadingUi.showLoading({
          title: "Preparing Download",
          messages: [
            "Structuring content...",
            "Finalizing your notes...",
            "Preparing your download..."
          ]
        });
      }
      downloadBlob(content, "text/plain;charset=utf-8", `${baseName}-notes.txt`);
      window.localStorage.removeItem("lockedin_generated_notes");
    }

  } catch (_err) {
    console.error("Download failed:", _err);
    showToast("Download failed. Please try again.", 'error');
  } finally {
    if (loadingUi) {
      loadingUi.hideLoading();
    }
    // Part 6 + 9 — Archive Completion + Success Animation
    if (downloadNotesBtn && !downloadNotesBtn.disabled) {
      triggerArchiveCompletion(downloadNotesBtn);
      triggerSuccessAnimation(downloadNotesBtn, { label: "✦ Archived" });
    }
    window.setTimeout(() => {
      isDownloading = false;
      if (downloadNotesBtn) downloadNotesBtn.disabled = false;
    }, 450);
  }
}

function copyNotesToClipboard() {
  if (!generatedNotes) return;

  navigator.clipboard
    .writeText(generatedNotes)
    .then(() => {
      if (copyNotesBtn) {
        triggerSuccessAnimation(copyNotesBtn, { label: "✓ Copied!" });
      }
    })
    .catch(() => {
      showToast("Failed to copy to clipboard", 'error');
    });
}

function initNavigation() {
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const target = "session.html?view=feedback";
      window.location.href = target;
    });
  }
}

setupFormatButtons();

document.addEventListener("click", (event) => {
  if (!examModeToggle || !examModeDropdown) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (examModeToggle.contains(target) || examModeDropdown.contains(target)) return;
  closeExamModeDropdown();
});

if (downloadNotesBtn) {
  downloadNotesBtn.addEventListener("click", downloadNotes);
}

if (copyNotesBtn) {
  copyNotesBtn.addEventListener("click", copyNotesToClipboard);
}

initNavigation();

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    generateKnowledgePack();
  });
} else {
  generateKnowledgePack();
}

initInteractions();
