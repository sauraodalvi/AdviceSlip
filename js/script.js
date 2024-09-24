const adviceText = document.getElementById('advice-text');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const refreshBtn = document.getElementById('refresh-btn');
const searchStatus = document.getElementById('search-status');

let advice = null;
let searchResults = [];
let currentIndex = 0;
let isSearching = false;

async function fetchRandomAdvice() {
  try {
    const response = await fetch('https://api.adviceslip.com/advice');
    const data = await response.json();
    advice = { id: data.slip.id, advice: data.slip.advice };
    updateAdviceDisplay();
  } catch (error) {
    console.error('Error fetching advice:', error);
  }
}

async function searchAdvice() {
  const query = searchInput.value.trim();
  if (query === '') return;
  try {
    const response = await fetch(`https://api.adviceslip.com/advice/search/${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.slips) {
      searchResults = data.slips.map((slip) => ({ id: slip.id, advice: slip.advice }));
      currentIndex = 0;
      isSearching = true;
      updateAdviceDisplay();
      updateButtons();
      searchStatus.textContent = `Showing result ${currentIndex + 1} of ${searchResults.length}`;
    } else {
      searchResults = [];
      isSearching = false;
      updateAdviceDisplay();
      updateButtons();
      searchStatus.textContent = '';
    }
  } catch (error) {
    console.error('Error searching advice:', error);
  }
}

function updateAdviceDisplay() {
  if (isSearching && searchResults.length > 0) {
    adviceText.textContent = searchResults[currentIndex].advice;
  } else if (advice) {
    adviceText.textContent = advice.advice;
  } else {
    adviceText.textContent = 'Loading advice...';
  }
}

function updateButtons() {
  prevBtn.disabled = isSearching && currentIndex === 0;
  nextBtn.disabled = isSearching && currentIndex === searchResults.length - 1;
}

searchBtn.addEventListener('click', searchAdvice);
prevBtn.addEventListener('click', () => {
  currentIndex = Math.max(0, currentIndex - 1);
  updateAdviceDisplay();
  updateButtons();
  searchStatus.textContent = `Showing result ${currentIndex + 1} of ${searchResults.length}`;
});
nextBtn.addEventListener('click', () => {
  currentIndex = Math.min(searchResults.length - 1, currentIndex + 1);
  updateAdviceDisplay();
  updateButtons();
  searchStatus.textContent = `Showing result ${currentIndex + 1} of ${searchResults.length}`;
});
refreshBtn.addEventListener('click', () => {
  isSearching = false;
  fetchRandomAdvice();
  updateButtons();
  searchStatus.textContent = '';
});

fetchRandomAdvice();
