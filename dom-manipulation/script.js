// Initial array of quote objects
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
];

/**
 * Displays a random quote from the array
 */
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Select a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Clear previous content and create new elements
  quoteDisplay.innerHTML = ''; 
  
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteText.style.fontStyle = 'italic';

  const quoteCategory = document.createElement('span');
  quoteCategory.textContent = `- Category: ${randomQuote.category}`;
  quoteText.style.fontWeight = 'bold';

  // Append new elements to the DOM
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

/**
 * Adds a new quote to the array and updates the interface
 */
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  // Basic validation
  if (text === '' || category === '') {
    alert("Please fill in both the quote and the category.");
    return;
  }

  // Update the data array
  quotes.push({ text: text, category: category });

  // Clear inputs for the next entry
  textInput.value = '';
  categoryInput.value = '';

  alert("Quote added successfully!");
}

// Event Listener for the main button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

