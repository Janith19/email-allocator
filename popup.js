// popup.js

// Elements
const nameInput = document.getElementById("catName");
const keywordsInput = document.getElementById("catKeywords");
const addBtn = document.getElementById("addBtn");
const categoryList = document.getElementById("categoryList");
const colorSwatches = document.querySelectorAll(".color-swatch");

// State
let selectedColor = "#34a853"; // default
let categories = [];

// Load categories from storage
chrome.storage.sync.get(["categories"], (result) => {
  categories = result.categories || [];
  renderCategories();
});

// Handle color swatch selection
colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    selectedColor = swatch.dataset.color;
    // mark the selected swatch
    colorSwatches.forEach((s) => s.classList.remove("selected"));
    swatch.classList.add("selected");
  });
});

// Add category
addBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const keywords = keywordsInput.value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!name || !keywords.length)
    return alert("Please add a name and at least one keyword.");

  categories.push({ name, keywords, color: selectedColor });

  await chrome.storage.sync.set({ categories });

  nameInput.value = "";
  keywordsInput.value = "";
  renderCategories();
});

// Render categories
function renderCategories() {
  categoryList.innerHTML = "";

  categories.forEach((cat, index) => {
    const card = document.createElement("div");
    card.className = "category-card";

    // header with name + delete icon
    const header = document.createElement("div");
    header.className = "category-header";

    const nameDiv = document.createElement("div");
    nameDiv.className = "category-name";
    nameDiv.innerHTML = `<span class="color-circle" style="background:${cat.color}"></span>${cat.name}`;

    const deleteIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    deleteIcon.setAttribute("viewBox", "0 0 24 24");
    deleteIcon.classList.add("delete-icon");
    deleteIcon.innerHTML = `<path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2"/>`;

    deleteIcon.addEventListener("click", async () => {
      categories.splice(index, 1);
      await chrome.storage.sync.set({ categories });
      renderCategories();
    });

    header.appendChild(nameDiv);
    header.appendChild(deleteIcon);

    // keywords
    const keywordsDiv = document.createElement("div");
    keywordsDiv.className = "keywords";
    cat.keywords.forEach((kw) => {
      const span = document.createElement("span");
      span.className = "keyword-tag";
      span.textContent = kw;
      keywordsDiv.appendChild(span);
    });

    card.appendChild(header);
    card.appendChild(keywordsDiv);
    categoryList.appendChild(card);
  });
}
