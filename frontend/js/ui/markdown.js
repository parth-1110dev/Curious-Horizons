import { marked } from "marked";

// ─── KaTeX Rendering Helpers ───────────────────────────────────────────────

function isKatexAvailable() {
  return typeof window.katex !== "undefined" && typeof window.katex.renderToString === "function";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderLatex(latex, displayMode) {
  const normalizedLatex = String(latex || "").trim();
  if (!normalizedLatex) {
    return displayMode ? '<div class="math-fallback"></div>' : "";
  }

  if (!isKatexAvailable()) {
    return `<span class="math-fallback">${escapeHtml(displayMode ? `$$${normalizedLatex}$$` : `$${normalizedLatex}$`)}</span>`;
  }

  try {
    const rendered = window.katex.renderToString(normalizedLatex, {
      displayMode,
      throwOnError: false,
      strict: "warn",
      trust: false,
    });
    
    if (displayMode) {
      return `<div class="math-block">${rendered}</div>`;
    }
    return rendered;
  } catch (_error) {
    return `<span class="math-fallback">${escapeHtml(displayMode ? `$$${normalizedLatex}$$` : `$${normalizedLatex}$`)}</span>`;
  }
}

// ─── Math Extraction Logic ─────────────────────────────────────────────────

function isEscaped(text, index) {
  let backslashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) {
    backslashCount += 1;
  }
  return backslashCount % 2 === 1;
}

function looksLikeMathContent(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return false;

  if (/\\[A-Za-z]+/.test(normalized)) return true;
  if (/\b(?:sin|cos|tan|log|ln|exp|frac|sqrt|sum|prod|int)\b/.test(normalized)) return true;

  const hasMathOperator =
    normalized.includes("=") ||
    normalized.includes("^") ||
    normalized.includes("_") ||
    normalized.includes("/") ||
    normalized.includes("+") ||
    normalized.includes("-") ||
    normalized.includes("*");

  if (hasMathOperator && /[A-Za-z0-9]/.test(normalized)) return true;

  return false;
}

function makeMathToken(index) {
  return `@@LOCKEDIN_MATH_BLOCK_${index}@@`;
}

function findEscapedClosing(text, startIndex, closeChar) {
  for (let index = startIndex; index < text.length - 1; index += 1) {
    if (text[index] !== "\\" || text[index + 1] !== closeChar) continue;
    if (isEscaped(text, index)) continue;
    return index;
  }
  return -1;
}

function findMatchingFence(text, startIndex, openChar, closeChar) {
  let depth = 0;
  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === openChar) {
      depth += 1;
      continue;
    }
    if (char === closeChar) {
      if (depth === 0) return index;
      depth -= 1;
    }
  }
  return -1;
}

function findClosingDelimiter(text, startIndex, delimiter) {
  for (let index = startIndex; index < text.length; index += 1) {
    if (text[index] !== "$") continue;
    if (delimiter === "$$") {
      if (text[index + 1] !== "$") continue;
      if (isEscaped(text, index)) {
        index += 1;
        continue;
      }
      return index;
    }

    if (text[index + 1] === "$") continue;
    if (isEscaped(text, index)) continue;
    return index;
  }
  return -1;
}

function extractSessionMathBlocks(markdown) {
  const source = String(markdown || "");
  const blocks = [];
  let output = "";

  function appendMathBlock(startIndex, endIndex, latex, displayMode) {
    const token = makeMathToken(blocks.length);
    blocks.push({ token, latex, displayMode });
    output += token;
    return endIndex + 1;
  }

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "\\" && source[index + 1] === "(") {
      const closingIndex = findEscapedClosing(source, index + 2, ")");
      if (closingIndex !== -1) {
        const latex = source.slice(index + 2, closingIndex);
        index = appendMathBlock(index, closingIndex + 1, latex, false) - 1;
        continue;
      }
    }

    if (char === "\\" && source[index + 1] === "[") {
      const closingIndex = findEscapedClosing(source, index + 2, "]");
      if (closingIndex !== -1) {
        const latex = source.slice(index + 2, closingIndex);
        index = appendMathBlock(index, closingIndex + 1, latex, true) - 1;
        continue;
      }
    }

    if (char === "$") {
      const isDisplay = source[index + 1] === "$";
      const openingLength = isDisplay ? 2 : 1;
      const closingIndex = findClosingDelimiter(source, index + openingLength, isDisplay ? "$$" : "$");
      if (closingIndex !== -1) {
        const latex = source.slice(index + openingLength, closingIndex);
        index = appendMathBlock(index, closingIndex + openingLength - 1, latex, isDisplay) - 1;
        continue;
      }
    }

    if (char === "(") {
      const closingIndex = findMatchingFence(source, index + 1, "(", ")");
      if (closingIndex !== -1) {
        const latex = source.slice(index + 1, closingIndex);
        if (looksLikeMathContent(latex)) {
          index = appendMathBlock(index, closingIndex, latex, false) - 1;
          continue;
        }
      }
    }

    if (char === "[") {
      const closingIndex = findMatchingFence(source, index + 1, "[", "]");
      if (closingIndex !== -1) {
        const latex = source.slice(index + 1, closingIndex);
        if (looksLikeMathContent(latex)) {
          index = appendMathBlock(index, closingIndex, latex, true) - 1;
          continue;
        }
      }
    }

    output += char;
  }

  return { markdown: output, blocks };
}

// ─── Main Renderer ─────────────────────────────────────────────────────────

/**
 * Robustly renders markdown to HTML.
 * Handles math equations (KaTeX) seamlessly.
 *
 * @param {string} markdown - The raw markdown text from the AI.
 * @returns {string} The fully rendered HTML string.
 */
export function renderMarkdown(markdown) {
  if (!markdown) return "";
  
  // 1. Extract math so marked doesn't mangle it
  const { markdown: strippedMarkdown, blocks } = extractSessionMathBlocks(markdown);
  
  // 2. Configure marked (you can add custom renderers here if needed)
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // 3. Parse markdown to HTML
  let html = marked.parse(strippedMarkdown);

  // 4. Inject KaTeX rendered HTML back in place of tokens
  blocks.forEach((block) => {
    const renderedLatex = renderLatex(block.latex, block.displayMode);
    
    // Marked might wrap our block token in a <p> tag if it was on its own line.
    // If it's display mode, we often want to strip that enclosing <p> to avoid invalid nesting.
    if (block.displayMode) {
      const tokenInP = new RegExp(`<p>\\s*${block.token}\\s*<\\/p>`, 'g');
      if (tokenInP.test(html)) {
        html = html.replace(tokenInP, renderedLatex);
        return;
      }
    }
    
    html = html.replace(block.token, renderedLatex);
  });

  return html;
}
