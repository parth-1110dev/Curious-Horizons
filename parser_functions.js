function isMathTokenLine(trimmedLine) {
  return typeof trimmedLine === "string" && sessionMathBlocks.has(trimmedLine);
}

function flushTable(fragment, rendererState) {
  if (!rendererState.tableRows || rendererState.tableRows.length < 2) {
    // Not a valid table ΓÇö emit as paragraphs
    if (rendererState.tableRows) {
      for (const raw of rendererState.tableRows) {
        fragment.appendChild(createMarkdownBlock("p", "", raw));
      }
    }
    rendererState.tableRows = null;
    return;
  }

  const rows = rendererState.tableRows;
  rendererState.tableRows = null;

  // Parse cells from a raw markdown table row string
  function parseCells(row) {
    return row
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  }

  // Determine which row is the separator row (---, :---:, etc.)
  const sepIndex = rows.findIndex((r) => /^\|?[\s:|-]+\|/.test(r) && /---/.test(r));

  let headerRows = [];
  let bodyRows = [];

  if (sepIndex === 1) {
    headerRows = [rows[0]];
    bodyRows = rows.slice(2);
  } else if (sepIndex > 1) {
    headerRows = rows.slice(0, sepIndex);
    bodyRows = rows.slice(sepIndex + 1);
  } else {
    bodyRows = rows;
  }

  const table = document.createElement("table");
  table.className = "session-table";

  if (headerRows.length > 0) {
    const thead = document.createElement("thead");
    for (const headerRow of headerRows) {
      const tr = document.createElement("tr");
      for (const cell of parseCells(headerRow)) {
        const th = document.createElement("th");
        th.innerHTML = renderInlineContent(cell);
        tr.appendChild(th);
      }
      thead.appendChild(tr);
    }
    table.appendChild(thead);
  }

  if (bodyRows.length > 0) {
    const tbody = document.createElement("tbody");
    for (const bodyRow of bodyRows) {
      const tr = document.createElement("tr");
      for (const cell of parseCells(bodyRow)) {
        const td = document.createElement("td");
        td.innerHTML = renderInlineContent(cell);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
  }

  fragment.appendChild(table);
}

function appendMarkdownLine(fragment, rendererState, rawLine) {
  const trimmed = rawLine.trim();

  // ΓöÇΓöÇ Table detection ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // A table row starts with '|' OR contains at least two '|' separators
  const isTableRow = trimmed.startsWith("|") || (trimmed.includes("|") && (trimmed.match(/\|/g) || []).length >= 2);

  if (isTableRow) {
    if (!rendererState.tableRows) {
      // Flush any open list before starting a table
      rendererState.listEl = null;
      rendererState.tableRows = [];
    }
    rendererState.tableRows.push(trimmed);
    return;
  }

  // Non-table line: flush any buffered table first
  if (rendererState.tableRows) {
    flushTable(fragment, rendererState);
  }
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  if (isMathTokenLine(trimmed)) {
    rendererState.listEl = null;
    const mathBlock = createMathTokenBlock(trimmed);
    if (mathBlock) {
      fragment.appendChild(mathBlock);
    }
    return;
  }

  if (rendererState.mathBlock) {
    const closingIndex = rawLine.indexOf("$$");
    if (closingIndex === -1) {
      rendererState.mathBlock.lines.push(rawLine);
      return;
    }

    rendererState.mathBlock.lines.push(rawLine.slice(0, closingIndex));
    fragment.appendChild(createMathBlock(rendererState.mathBlock.lines.join("\n")));
    rendererState.mathBlock = null;

    const remainder = rawLine.slice(closingIndex + 2).trim();
    if (remainder) {
      appendMarkdownLine(fragment, rendererState, remainder);
    }
    return;
  }

  if (trimmed.startsWith("$$")) {
    const endIndex = trimmed.lastIndexOf("$$");
    if (endIndex > 1) {
      const latex = trimmed.slice(2, endIndex);
      fragment.appendChild(createMathBlock(latex));
      const remainder = trimmed.slice(endIndex + 2).trim();
      if (remainder) {
        appendMarkdownLine(fragment, rendererState, remainder);
      }
      return;
    }

    rendererState.mathBlock = { lines: [rawLine.slice(rawLine.indexOf("$$") + 2)] };
    return;
  }

  if (trimmed === "") {
    // Do NOT close the list on empty lines. Markdown lists can contain empty lines.
    return;
  }

  // Heading handlers ΓÇö checked most-specific first to prevent short patterns
  // (## or #) from matching longer ones (### or ####).

  // 1. Universal Subheading Component (h3 with hollow circle)
  // Maps actual markdown subheadings (###, ####) to the same component
  if (/^####?\s+/.test(trimmed)) {
    rendererState.listEl = null;
    fragment.appendChild(createMarkdownBlock("h3", "", trimmed.replace(/^####?\s+/, "")));
    return;
  }

  // Intercept pseudo-subheadings (e.g., "- **Normalization:**" or "**Atomicity**")
  // which the AI frequently generates instead of proper ### tags.
  const pseudoSubheadingMatch = trimmed.match(/^[-*]?\s*\*\*(.+?)\*\*(\s*:)?\s*$/);
  if (pseudoSubheadingMatch) {
    rendererState.listEl = null;
    let text = pseudoSubheadingMatch[1].trim();
    // Strip trailing colon (whether it was inside or outside the bold asterisks)
    text = text.replace(/:\s*$/, "");
    fragment.appendChild(createMarkdownBlock("h3", "", text));
    return;
  }

  if (/^##\s+/.test(trimmed)) {
    rendererState.listEl = null;
    fragment.appendChild(createMarkdownBlock("h2", "", trimmed.replace(/^##\s+/, "")));
    return;
  }

  // Single # heading maps to h2 (same visual weight ΓÇö document title level)
  if (/^#\s+/.test(trimmed)) {
    rendererState.listEl = null;
    fragment.appendChild(createMarkdownBlock("h2", "", trimmed.replace(/^#\s+/, "")));
    return;
  }

  if (/^[-*]\s+/.test(trimmed)) {
    const isIndented = /^\s+/.test(rawLine);
    const content = trimmed.replace(/^[-*]\s+/, "");

    // If indented and a list is active, attach as a nested sub-list
    if (isIndented && rendererState.listEl && rendererState.listEl.lastChild) {
      const lastLi = rendererState.listEl.lastChild;
      let subList = lastLi.querySelector("ul");
      if (!subList) {
        subList = document.createElement("ul");
        lastLi.appendChild(subList);
      }
      subList.appendChild(createMarkdownBlock("li", "", content));
      return;
    }

    // Close any open ordered list before starting a top-level unordered one
    if (rendererState.listEl && rendererState.listEl.tagName === "OL") {
      rendererState.listEl = null;
    }
    if (!rendererState.listEl) {
      rendererState.listEl = document.createElement("ul");
      fragment.appendChild(rendererState.listEl);
    }
    rendererState.listEl.appendChild(
      createMarkdownBlock("li", "", content)
    );
    return;
  }

  // Numbered list: "1. item", "2. item", etc.
  if (/^\d+\.\s+/.test(trimmed)) {
    const isIndented = /^\s+/.test(rawLine);
    const content = trimmed.replace(/^\d+\.\s+/, "");

    // If indented and a list is active, attach as a nested sub-list
    if (isIndented && rendererState.listEl && rendererState.listEl.lastChild) {
      const lastLi = rendererState.listEl.lastChild;
      let subList = lastLi.querySelector("ol");
      if (!subList) {
        subList = document.createElement("ol");
        lastLi.appendChild(subList);
      }
      subList.appendChild(createMarkdownBlock("li", "", content));
      return;
    }

    // Close any open unordered list before starting a top-level ordered one
    if (rendererState.listEl && rendererState.listEl.tagName === "UL") {
      rendererState.listEl = null;
    }
    if (!rendererState.listEl || rendererState.listEl.tagName !== "OL") {
      rendererState.listEl = document.createElement("ol");
      fragment.appendChild(rendererState.listEl);
    }
    rendererState.listEl.appendChild(
      createMarkdownBlock("li", "", content)
    );
    return;
  }

  // Handle regular paragraphs
  const isIndented = /^\s+/.test(rawLine);
  
  // If a line is indented and a list is active, it's a multiline list item
  // Append it as a paragraph inside the current list item instead of breaking the list.
  if (isIndented && rendererState.listEl && rendererState.listEl.lastChild) {
    rendererState.listEl.lastChild.appendChild(createMarkdownBlock("p", "", trimmed));
    return;
  }

  rendererState.listEl = null;
  fragment.appendChild(createMarkdownBlock("p", "", trimmed));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyInlineBold(escapedText) {
  return escapedText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

