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

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastViewedQuote(quoteObj) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quoteObj));
}

function saveLastCategory(category) {
  localStorage.setItem("lastCategory", category);
}

function loadLastViewedQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastQuote) displayQuote(lastQuote);
}

// =======================
//  CATEGORY FUNCTIONS
// =======================

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("lastCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
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
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// =======================
//  JSON IMPORT / EXPORT
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

// ============================================================
//  🔥 SERVER SYNC — fetchPeriodicQuotesFromServer()
// ============================================================

// Convert API posts into quote objects
function postToQuote(post) {
  return {
    text: post.title,
    category: "Server"
  };
}

// Fetch from JSONPlaceholder + merge with local quotes
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");

    if (!response.ok) {
      throw new Error("Failed to fetch quotes.");
    }

    const serverPosts = await response.json();
    const serverQuotes = serverPosts.map(postToQuote);

    // Conflict Rule: SERVER WINS
    const localQuoteTexts = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !localQuoteTexts.has(q.text));

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();

      showSyncNotification(`✔ Synced ${newQuotes.length} new quotes from server.`);
    }

  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Show a small notification under the screen
function showSyncNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#e0ffe0";
  note.style.border = "1px solid #4CAF50";
  note.style.padding = "10px";
  note.style.marginTop = "10px";
  note.style.fontSize = "14px";

  document.body.appendChild(note);

  setTimeout(() => note.remove(), 4000);
}

// Auto-sync every 60 seconds
setInterval(fetchQuotesFromServer, 60000);

// Run sync once on startup
fetchQuotesFromServer();

// =======================
//  EVENT LISTENERS / STARTUP
// =======================
newQuoteBtn.addEventListener("click", showRandomQuote);
populateCategories();
loadLastViewedQuote();
