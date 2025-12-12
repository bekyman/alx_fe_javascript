// =======================
//  INITIALIZATION
// =======================

// Load quotes from localStorage OR use default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// =======================
//  STORAGE FUNCTIONS
// =======================

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save last viewed quote to sessionStorage
function saveLastViewedQuote(quoteObj) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quoteObj));
}

// Save last selected category
function saveLastCategory(category) {
  localStorage.setItem("lastCategory", category);
}

// Load last viewed quote on startup
function loadLastViewedQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastQuote) displayQuote(lastQuote);
}

// =======================
//  CATEGORY FUNCTIONS
// =======================

// Extract unique categories and populate dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear old categories
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  // Add dynamic categories
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if saved
  const savedCategory = localStorage.getItem("lastCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes(); // Apply filter immediately
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;

  // Save selected filter
  saveLastCategory(selectedCategory);

  if (selectedCategory === "all") {
    quoteDisplay.innerHTML = "<p>Showing all quotes. Click 'Show New Quote'.</p>";
    return;
  }

  const filtered = quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found in category: <strong>${selectedCategory}</strong></p>`;
    return;
  }

  // Show first matching quote
  displayQuote(filtered[0]);
}

// =======================
//  QUOTE DISPLAY FUNCTION
// =======================

function displayQuote(quoteObj) {
  const { text, category } = quoteObj;

  quoteDisplay.innerHTML = "";

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `— ${category}`;
  quoteCategory.style.fontStyle = "italic";
  quoteCategory.style.color = "gray";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Show random quote (respects filter)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  let pool = quotes;
  if (selectedCategory !== "all") {
    pool = quotes.filter(q => q.category === selectedCategory);
  }

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedQuote = pool[randomIndex];
  
  displayQuote(selectedQuote);
  saveLastViewedQuote(selectedQuote);
}

// =======================
//  ADD NEW QUOTE
// =======================

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  saveQuotes(); 
  populateCategories(); // update dropdown if new category added

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// =======================
//  JSON IMPORT/EXPORT
// =======================

function exportToJson() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format!");
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();

      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Error reading JSON file");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

// =======================
//  EVENT LISTENERS / RUN
// =======================
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize categories + last viewed quote
populateCategories();
loadLastViewedQuote();
