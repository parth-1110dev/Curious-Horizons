import { renderMarkdown } from "./markdown.js";

/**
 * StreamRenderer — Progressive section-by-section markdown renderer.
 * Buffers incoming text, detects section boundaries (##), and renders them
 * individually to minimize DOM layout thrashing and avoid re-rendering the whole document.
 */
export class StreamRenderer {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.buffer = "";
    this.renderedSections = 0;
    this.isFinished = false;
    this.onFirstSectionRendered = null; // Callback for TTFL tracking
    
    // Clear container
    if (this.containerEl) {
      this.containerEl.innerHTML = "";
    }
  }

  appendChunk(text) {
    if (this.isFinished) return;
    
    this.buffer += text;
    this.processBuffer();
  }

  processBuffer() {
    // Look for "\n## " or "\n# " as a section boundary.
    // We want to slice the buffer up to the start of the NEXT section.
    // However, if there are multiple sections in the buffer, we process them one by one.
    
    while (true) {
      // Find the first heading starting from index > 0.
      // This means we are inside a section, and looking for where it ends.
      const nextHeadingIndex = this.findNextBoundaryIndex(this.buffer);
      
      if (nextHeadingIndex !== -1) {
        // We have a complete section from 0 to nextHeadingIndex
        const sectionContent = this.buffer.slice(0, nextHeadingIndex);
        this.buffer = this.buffer.slice(nextHeadingIndex); // Keep the newline + heading for the next section
        
        this.renderSection(sectionContent);
      } else {
        break; // No complete section found yet
      }
    }
  }

  findNextBoundaryIndex(text) {
    // We only care about boundaries that are NOT at index 0.
    // So we search starting from index 1.
    const h2Index = text.indexOf("\n## ", 1);
    const h1Index = text.indexOf("\n# ", 1);
    
    if (h2Index === -1 && h1Index === -1) return -1;
    if (h2Index === -1) return h1Index;
    if (h1Index === -1) return h2Index;
    return Math.min(h1Index, h2Index);
  }

  renderSection(markdown) {
    if (!this.containerEl || !markdown.trim()) return;

    const html = renderMarkdown(markdown);
    if (!html.trim()) return;

    const sectionEl = document.createElement("div");
    sectionEl.className = "session-section session-section-enter";
    sectionEl.innerHTML = html;
    
    this.containerEl.appendChild(sectionEl);
    
    // Trigger entrance animation
    // Using requestAnimationFrame ensures the initial state is painted before adding the active class
    window.requestAnimationFrame(() => {
      sectionEl.classList.add("session-section-enter-active");
    });
    
    this.renderedSections++;
    
    if (this.renderedSections === 1 && typeof this.onFirstSectionRendered === "function") {
      this.onFirstSectionRendered();
    }
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    
    // Render whatever is left in the buffer
    if (this.buffer.trim()) {
      this.renderSection(this.buffer);
      this.buffer = "";
    }
  }

  getSectionCount() {
    return this.renderedSections;
  }
}
