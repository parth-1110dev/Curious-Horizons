async function fetchAiSessionContent(topic, minutes, plan, explanationMode) {
  if (generateRequestInFlight) {
    return;
  }

  let loadingUi = null;
  try {
    loadingUi = await import('./js/ui/loading.js');
  } catch (e) {
    console.warn("Failed to load loading UI", e);
  }

  if (!clientRateAllowAndRecord()) {
    if (loadingUi) loadingUi.hideLoading();
    renderSessionPlainText(
      "You're making requests too quickly. Please wait a moment.",
      { textAlign: "center" }
    );
    return;
  }

  generateRequestInFlight = true;
  const requestStartedAt = window.performance.now();
  
  if (loadingUi) {
    loadingUi.showLoading({
      title: "Preparing your learning journey",
      messages: [
        "Exploring the horizon...",
        "Understanding your topic...",
        "Connecting ideas...",
        "Structuring knowledge...",
        "Preparing your learning session..."
      ]
    });
  } else {
    renderSessionPlainText("Generating your session...", { textAlign: "center" });
  }

  try {
    const payload = {
      topic,
      duration: minutes,
      plan,
    };

    if (explanationMode) {
      payload.explanation_mode = explanationMode;
    }

    const response = await window.fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (data.error || response.status === 429) {
      renderSessionPlainText(
        "You're making requests too quickly. Please wait a moment.",
        { textAlign: "center" }
      );
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const content = typeof data?.content === "string" ? data.content.trim() : "";
    if (!content || content.startsWith("Error occurred:")) {
      throw new Error("Backend returned an error payload");
    }

    if (plan === "free") {
      incrementFreeSessionsUsedToday();
    }

    logSessionPerformance("session payload received", {
      topic,
      minutes,
      plan,
      networkMs: Math.round(window.performance.now() - requestStartedAt),
      characters: content.length,
    });

    renderSessionMarkdown(content, { startedAt: requestStartedAt });
  } catch (_error) {
    renderSessionPlainText("Something went wrong. Please try again.", {
      textAlign: "center",
    });
  } finally {
    generateRequestInFlight = false;
    if (loadingUi) {
      loadingUi.hideLoading();
    }
  }
}

