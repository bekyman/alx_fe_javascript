// ============================================================
//  INITIALIZATION
// ============================================================

// Load quotes from localStorage OR use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");


// ============================================================
//  STORAGE FUNCTIONS
// ============================================================

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


// ============================================================
//  CATEGORY SYSTEM
// ============================================================

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


// ============================================================
//  QUOTE DISPLAY
// ============================================================

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


// ============================================================
//  ADD NEW QUOTE
// ============================================================

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


// ============================================================
//  JSON IMPORT / EXPORT
// ============================================================

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
//  🔥 SERVER SYNC SYSTEM (GET, POST, CONFLICT RESOLUTION)
// ============================================================

// SEND LOCAL QUOTES TO SERVER
async function sendLocalQuotesToServer() {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    console.log("Local quotes sent to server (POST simulation).");
  } catch (error) {
    console.error("POST error:", error);
  }
}

// FETCH SERVER QUOTES (GET)
async function fetchServerQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");

    if (!response.ok) throw new Error("Server GET failed");

    const serverData = await response.json();

    // Convert server posts to our quote format
    return serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

  } catch (error) {
    console.error("GET error:", error);
    return [];
  }
}

// MAIN SYNC FUNCTION
async function syncQuotes() {
  console.log("🔄 Syncing with server...");

  // 1. POST local quotes
  await sendLocalQuotesToServer();

  // 2. GET server quotes
  const serverQuotes = await fetchServerQuotes();

  // 3. Conflict resolution — server wins
  const localTexts = new Set(quotes.map(q => q.text));
  const newQuotes = serverQuotes.filter(q => !localTexts.has(q.text));

  if (newQuotes.length > 0) {
    console.log(`✔ Adding ${newQuotes.length} new quotes from server`);
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
  } else {
    console.log("No new quotes from server.");
  }
}


// ============================================================
//  PERIODIC SYNC (EVERY 30 SECONDS)
// ============================================================

setInterval(syncQuotes, 30000);

// Run first sync on page load
syncQuotes();


// ============================================================
//  EVENT LISTENERS
// ============================================================

newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize
populateCategories();
loadLastViewedQuote();
