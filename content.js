/**
 * Function Health Lab Exporter - Content Script
 * Injects export button and handles data fetching from Function Health API
 */

function injectExportButton() {
  // Prevent duplicate buttons
  if (document.getElementById("fh-export-btn")) return;

  const btn = document.createElement("button");
  btn.id = "fh-export-btn";
  btn.textContent = "Export Function Labs";

  // Style the button
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    background: "#3b82f6",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease"
  });

  // Add hover effect
  btn.onmouseenter = () => {
    btn.style.background = "#2563eb";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  };
  btn.onmouseleave = () => {
    btn.style.background = "#3b82f6";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  };

  btn.onclick = async () => {
    btn.disabled = true;
    btn.style.cursor = "wait";
    btn.style.opacity = "0.7";
    btn.textContent = "Exporting...";

    try {
      // Fetch data from Function Health API
      const url = "https://production-member-app-mid-lhuqotpy2a-ue.a.run.app/api/v1/results-report";
      
      // Required headers for Function Health API authentication
      // The fe-app-version header is critical - without it, the API returns 401 Unauthorized
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "fe-app-version": "0.84.70",
          "origin": "https://my.functionhealth.com",
          "referer": "https://my.functionhealth.com/",
          "x-backend-skip-cache": "true"
        }
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Send data to background script for processing
      chrome.runtime.sendMessage(
        { type: "FH_EXPORT_DATA", payload: data },
        (response) => {
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
          
          if (response?.status === "ok") {
            btn.textContent = `✓ Exported ${response.rowCount} results!`;
            btn.style.background = "#10b981";
          } else {
            btn.textContent = "Export Failed";
            btn.style.background = "#ef4444";
            console.error("Export error:", response?.message);
          }
          
          // Reset button after 3 seconds
          setTimeout(() => {
            btn.textContent = "Export Function Labs";
            btn.style.background = "#3b82f6";
          }, 3000);
        }
      );
    } catch (e) {
      console.error("Export error:", e);
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      btn.textContent = "Error — Try Again";
      btn.style.background = "#ef4444";
      
      setTimeout(() => {
        btn.textContent = "Export Function Labs";
        btn.style.background = "#3b82f6";
      }, 3000);
    }
  };

  document.body.appendChild(btn);
  console.log("Function Health Export button injected");
}

// Wait for page load and inject button
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(injectExportButton, 2000);
  });
} else {
  setTimeout(injectExportButton, 2000);
}