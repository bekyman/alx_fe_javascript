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

// Load last viewed quote on startup (optional feature)
function loadLastViewedQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastQuote) {
    displayQuote(lastQuote);
  }
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

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

  displayQuote(selectedQuote);

  // Save last viewed quote in sessionStorage
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

  saveQuotes(); // Save to local storage

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// =======================
//  JSON EXPORT
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

// =======================
//  JSON IMPORT
// =======================

function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format!");
        return;
      }

      // Add imported quotes to existing quotes
      quotes.push(...importedQuotes);

      saveQuotes(); // store in localStorage

      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Error reading JSON file");
