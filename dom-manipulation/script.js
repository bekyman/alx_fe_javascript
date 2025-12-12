/* ============================================================
   Dynamic Quote Generator — FULL script.js
   Includes:
   - LocalStorage support
   - Add / Delete quotes
   - Server sync simulation (via JSONPlaceholder)
   - Conflict resolution (server wins)
   - UI notifications for updates
   - Periodic background synchronization
============================================================ */

const quoteDisplay = document.getElementById("quoteDisplay");
const quoteList = document.getElementById("quoteList");
const notification = document.getElementById("notification");

// Local Storage Key
const LS_KEY = "quotesData";

// Base Server URL (Simulation)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from LocalStorage
function loadLocalQuotes() {
  const saved = localStorage.getItem(LS_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Save quotes to LocalStorage
function saveLocalQuotes(quotes) {
  localStorage.setItem(LS_KEY, JSON.stringify(quotes));
}

/* ============================================================
   UI: Notification helper
============================================================ */
function showNotification(message, type = "info") {
  notification.textContent = message;
  notification.className = type;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

/* ============================================================
   UI: Render Quotes List
============================================================ */
function renderQuoteList() {
  const quotes = loadLocalQuotes();
  quoteList.innerHTML = "";

  quotes.forEach((q, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      "${q.text}"
      <button onclick="deleteQuote(${index})">Delete</button>
    `;
    quoteList.appendChild(li);
  });
}

/* ============================================================
   Quote Actions
============================================================ */

// Show random quote
function generateQuote() {
  const quotes = loadLocalQuotes();
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = random.text;
}

// Add new quote locally AND sync to server
async function addQuote() {
  const newQuote = document.getElementById("newQuote").value.trim();
  if (!newQuote) return;

  const quotes = loadLocalQuotes();
  const quoteObj = {
    text: newQuote,
    timestamp: Date.now() // used for conflict resolution
  };

  quotes.push(quoteObj);
  saveLocalQuotes(quotes);
  renderQuoteList();

  // Try POSTING to server
  try {
    await postQuoteToServer(quoteObj);
    showNotification("Quote added & synced with server.", "success");
  } catch (err) {
    showNotification("Quote saved locally but server sync failed.", "error");
  }

  document.getElementById("newQuote").value = "";
}

// Delete a quote
function deleteQuote(index) {
  const quotes = loadLocalQuotes();
  quotes.splice(index, 1);
  saveLocalQuotes(quotes);
  renderQuoteList();
  showNotification("Quote deleted.");
}

/* ============================================================
   SERVER INTERACTION (Simulation)
============================================================ */

// POST new quote to server
async function postQuoteToServer(quote) {
  return fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "quote",
      body: quote.text,
      timestamp: quote.timestamp
    })
  }).then(res => res.json());
}

// FETCH quotes from server (simulated)
async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  const data = await res.json();

  // Convert mock posts into quote objects
  return data.slice(0, 10).map(post => ({
    text: post.body,
    timestamp: Date.now() // JSONPlaceholder does not support timestamps
  }));
}

/* ============================================================
   SYNC + CONFLICT RESOLUTION
============================================================ */

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = loadLocalQuotes();

    // Compare counts (simple conflict detection)
    if (JSON.stringify(localQuotes) !== JSON.stringify(serverQuotes)) {
      // Conflict Strategy: SERVER WINS
      saveLocalQuotes(serverQuotes);
      renderQuoteList();

      showNotification("Quotes updated from server (conflict resolved).", "warning");
    }
  } catch (err) {
    showNotification("Failed to sync with server.", "error");
  }
}

/* ============================================================
   Periodic Background Sync (every 10 seconds)
============================================================ */
setInterval(() => {
  syncQuotes();
}, 10000);

/* Initialize on first load */
renderQuoteList();
