(function () {
  const statusText = document.getElementById("api-status-text");

  if (!statusText) {
    return;
  }

  const apiBase =
    window.ST_MICHAEL_API_BASE ||
    localStorage.getItem("ST_MICHAEL_API_BASE") ||
    "";

  if (!apiBase) {
    statusText.textContent = "Готов к подключению на Render";
    return;
  }

  fetch(`${apiBase.replace(/\/$/, "")}/healthz`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      statusText.textContent = "Backend подключен";
    })
    .catch(() => {
      statusText.textContent = "Backend не отвечает";
    });
})();
