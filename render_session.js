function renderSessionMarkdown(markdown, { startedAt = null } = {}) {
  if (!sessionContentEl) return;
  cancelSessionMarkdownRender();
  clearSessionContent();
  resetSessionContentLayout();

  const normalizedMarkdown = String(markdown || "");
  try {
    window.localStorage.setItem(STORAGE_SESSION_CONTENT_KEY, normalizedMarkdown);
  } catch (_error) {
    // Ignore storage failures; rendering should still continue.
  }

  const extracted = extractSessionMathBlocks(normalizedMarkdown.replace(/\r\n/g, "\n"));
  sessionMathBlocks = new Map(extracted.blocks.map((block) => [block.token, block]));

  const lines = extracted.markdown.split("\n");
  if (lines.length === 1 && lines[0] === "") {
    return;
  }

  const rendererState = { listEl: null, mathBlock: null, tableRows: null };
  const renderToken = sessionMarkdownRenderToken;
  const renderStartAt = window.performance.now();
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < lines.length; index += 1) {
    appendMarkdownLine(fragment, rendererState, lines[index]);
  }
  // Flush any table that extended to the final line
  if (rendererState.tableRows) {
    flushTable(fragment, rendererState);
  }

  sessionMarkdownRenderFrameId = window.requestAnimationFrame(() => {
    if (renderToken !== sessionMarkdownRenderToken || !sessionContentEl) {
      return;
    }

    const domStartAt = window.performance.now();
    sessionContentEl.appendChild(fragment);
    sessionMarkdownRenderFrameId = null;

    logSessionPerformance("render markdown", {
      lines: lines.length,
      buildMs: Math.round(domStartAt - renderStartAt),
      domMs: Math.round(window.performance.now() - domStartAt),
      totalMs: startedAt ? Math.round(window.performance.now() - startedAt) : undefined,
    });
  });
}

