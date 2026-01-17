let host = null;
let shadow = null;
let timeoutId = null;

export function showIndicator(message, state = "loading") {
  if (!host) {
    host = document.createElement("div");
    host.style.position = "fixed";
    host.style.bottom = "20px";
    host.style.right = "20px";
    host.style.zIndex = "999999";

    shadow = host.attachShadow({ mode: "open" });
    document.body.appendChild(host);
  }

  const colors = {
    loading: "#2563eb",
    success: "#16a34a",
    error: "#dc2626"
  };

  shadow.innerHTML = `
    <style>
      .box {
        font-family: system-ui, sans-serif;
        background: white;
        border-left: 4px solid ${colors[state]};
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        color: #111;
        min-width: 220px;
        animation: fadein 0.2s ease-out;
      }
      @keyframes fadein {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
    <div class="box">${message}</div>
  `;

  clearTimeout(timeoutId);
  if (state !== "loading") {
    timeoutId = setTimeout(removeIndicator, 2200);
  }
}

export function removeIndicator() {
  if (host) {
    host.remove();
    host = null;
    shadow = null;
  }
}
