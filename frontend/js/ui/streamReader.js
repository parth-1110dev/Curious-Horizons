/**
 * StreamReader — Handles Server-Sent Events parsing from fetch Response.
 * Provides resilient streaming with AbortController timeout and manual chunk parsing.
 */

const STREAM_TIMEOUT_MS = 35000;

export async function fetchStream(url, options, callbacks) {
  const { onChunk, onStageChange, onDone, onError } = callbacks;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Timeout"));
  }, STREAM_TIMEOUT_MS);

  try {
    onStageChange("Preparing your lesson...");
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new Error("Too many requests. Please slow down.");
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    if (!response.body) {
      // Fallback for environments lacking ReadableStream (very old browsers)
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      onChunk(data.content);
      onDone();
      return;
    }

    onStageChange("Building your learning roadmap...");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let firstChunkReceived = false;

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Parse SSE line by line
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the incomplete last line in the buffer
      
      for (const line of lines) {
        if (!line.trim() || line.startsWith(":")) {
          continue; // Empty line or SSE comment
        }
        
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") {
            onStageChange("Finalizing session...");
            onDone();
            clearTimeout(timeoutId);
            return;
          }
          
          if (data.startsWith("[ERROR] ")) {
            throw new Error(data.slice(8));
          }

          if (!firstChunkReceived) {
            firstChunkReceived = true;
          }
          
          onChunk(data);
        }
      }
    }
    
    // If we break out cleanly but without [DONE] (e.g. truncated)
    if (buffer) {
       // try parsing one last time
       if (buffer.startsWith("data: ") && buffer !== "data: [DONE]") {
          onChunk(buffer.slice(6));
       }
    }
    
    onDone();

  } catch (err) {
    if (err.name === "AbortError" || err.message === "Timeout") {
      onError("This is taking longer than expected. Please try again.");
    } else if (err.message === "Failed to fetch") {
      onError("Connection lost. Check your connection and try again.");
    } else {
      onError(err.message || "An unexpected error occurred.");
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
