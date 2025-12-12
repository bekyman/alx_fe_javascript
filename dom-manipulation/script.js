// Load quotes from localStorage or default list
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Success is not final; failure is not fatal.", author: "Winston Churchill" },
];

// ------------------------------------------------------
// 1. Show a random quote
// ------------------------------------------------------
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
    return;
  }

  const random = Math.floor(Math.random() * quotes.length);
  const q = quotes[random];

  document.getElementById("quoteDisplay").innerHTML =
    `"${q.text}" — <b>${q.author}</b>`;
}

// ------------------------------------------------------
// 2. Add a new quote
// ------------------------------------------------------
function addQuote() {
  const text = document.getElementById("newQuote").value.trim();
  const author = document.getElementById("newAuthor").value.trim();

  if (!text || !author) {
    alert("Please enter both quote and author.");
    return;
  }

  quotes.push({ text, author });
  localStorage.setItem("quotes", JSON.stringify(quotes));

  document.getElementById("newQuote").value = "";
  document.getElementById("newAuthor").value = "";

  alert("Quote added successfully!");
}

// ------------------------------------------------------
// 3. Download quotes as JSON
// ------------------------------------------------------
function downloadJSON() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------
// 4. Load quotes from an uploaded JSON file
// ------------------------------------------------------
function loadFromJSON() {
  const fileInput = document.getElementById("jsonFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const jsonData = JSON.parse(event.target.result);

      if (!Array.isArray(jsonData)) {
        throw new Error("Invalid JSON format");
      }

      quotes = jsonData;
      localStorage.setItem("quotes", JSON.stringify(quotes));

      alert("Quotes loaded successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };

  reader.readAsText(file);
}

// ------------------------------------------------------
// 5. Fetch quotes from server (quotes.json file)
// ------------------------------------------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("quotes.json"); // file must exist in project folder

    if (!response.ok) {
      throw new Error("Failed to fetch quotes from server.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid JSON format: expected an array of quotes.");
    }

    quotes = data;
    localStorage.setItem("quotes", JSON.stringify(quotes));

    console.log("Quotes loaded from server:", quotes);
    return quotes;

  } catch (error) {
    console.error("Error in fetchQuotesFromServer():", error);
    return null;
  }
}

// Automatically load from server when the page loads
window.onload = function () {
  fetchQuotesFromServer();
};
// Load quotes from API when page starts
window.onload = function () {
  fetchQuotesFromServer();
};
