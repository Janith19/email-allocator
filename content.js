async function getCategories() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(["categories"], (result) => {
        resolve(result.categories || []);
      });
    } catch (e) {
      console.error("Failed to get categories from storage", e);
      resolve([]);
    }
  });
}

async function categorizeEmails() {
  const categories = await getCategories();
  const emailRows = document.querySelectorAll("tr.zA");

  emailRows.forEach((row) => {
    const subject = row.querySelector(".bog")?.innerText?.toLowerCase() || "";
    const sender =
      row.querySelector(".yX.xY .yW span")?.innerText?.toLowerCase() || "";
    const container = row.querySelector(".xW.xY");
    if (!container) return;

    // Remove existing badges
    container
      .querySelectorAll(".email-allocator-badge")
      .forEach((b) => b.remove());

    // Add badges
    for (const { name, keywords, color } of categories) {
      const matched = keywords.some(
        (kw) =>
          subject.includes(kw.toLowerCase()) ||
          sender.includes(kw.toLowerCase())
      );
      if (matched) {
        const badge = document.createElement("span");
        badge.className = "email-allocator-badge";
        badge.textContent = name;
        badge.style.backgroundColor = color || "#4285f4";
        badge.style.color = "#fff";
        badge.style.padding = "2px 6px";
        badge.style.marginLeft = "4px";
        badge.style.borderRadius = "10px";
        badge.style.fontSize = "11px";
        container.appendChild(badge);
        break; // only one badge per email
      }
    }
  });
}

// Debounced observer
let timeoutId;
function debounceCategorize() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(categorizeEmails, 300);
}

// Observe Gmail inbox
function observeInbox() {
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) {
    setTimeout(observeInbox, 1000);
    return;
  }
  const observer = new MutationObserver(debounceCategorize);
  observer.observe(inbox, { childList: true, subtree: true });
}

// Initialize categorizer
function init() {
  categorizeEmails();
  observeInbox();
}

// Wait until emails exist
function waitForInbox() {
  if (document.querySelectorAll("tr.zA").length) {
    init();
  } else {
    setTimeout(waitForInbox, 1000);
  }
}

waitForInbox();
