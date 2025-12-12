// =======================
//  SERVER SIMULATION SETUP
// =======================

// We simulate a server using JSONPlaceholder-like routes.
// In real projects, replace with your actual backend endpoint.
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// How often to sync with the server (ms)
const SYNC_INTERVAL = 30000; // 30 seconds

// =======================
//  INITIALIZATION
// =======================

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const syncNotice = document.getElementById("syncNotice");

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
    quoteDisplay.innerHTML = `<p>No quotes found in: <strong>${selectedCategory}</strong></p>`;
    return;
  }

  displayQuote(filtered[0]);
}

// =======================
//  QUOTE DISPLAY
// =======================

function displayQuote(quoteObj) {
  const { text, category } = quoteObj;
  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <span style="font-style:italic;color:gray">— ${category}</span>
  `;
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let pool = quotes;

  if (selectedCategory !== "all") {
    pool = quotes.filter(q => q.category === selectedCategory);
  }

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes for selected category.";
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
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";

  notifyUser("Quote added locally. Will sync with server.");
}

// =======================
//  SERVER SYNC FUNCTIONS
// =======================

// Notify bar
function notifyUser(message) {
  syncNotice.textContent = message;
  syncNotice.style.display = "block";
  setTimeout(() => syncNotice.style.display = "none", 4000);
}

// Fetch new quotes from server
async function fetchFromServer() {
  notifyUser("Checking server for updates…");

  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Transform server data into our quote structure
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    resolveConflicts(serverQuotes);

  } catch (err) {
    notifyUser("Error reaching server.");
  }
}

// Send local quotes to server (simulation)
async function pushToServer() {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quotes),
      headers: { "Content-Type": "application/json" }
    });
    notifyUser("Local changes synced to server.");
  } catch (err) {
    notifyUser("Failed to sync with server.");
  }
}

// =======================
//  CONFLICT RESOLUTION
// =======================

function resolveConflicts(serverQuotes) {
  // Strategy: SERVER ALWAYS WINS in case of conflict
  // But local quotes that do not overlap are preserved.

  const combined = [...serverQuotes];

  quotes.forEach(local => {
    const exists = serverQuotes.some(s => s.text === local.text);
    if (!exists) combined.push(local);
  });

  const changed = JSON.stringify(combined) !== JSON.stringify(quotes);

  if (changed) {
    quotes = combined;
    saveQuotes();
    populateCategories();
    notifyUser("Local data updated from server (server wins).");
  } else {
    notifyUser("Local data is already synced.");
  }
}

// =======================
//  PERIODIC SYNC LOOP
// =======================

setInterval(() => {
  fetchFromServer();
  pushToServer();
}, SYNC_INTERVAL);

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
      notifyUser("Imported quotes. Will sync soon.");

    } catch (err) {
      alert("Error reading JSON file");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

// =======================
//  RUN ON LOAD
// =======================

newQuoteBtn.addEventListener("click", showRandomQuote);

populateCategories();
loadLastViewedQuote();
fetchFromServer(); // initial sync
