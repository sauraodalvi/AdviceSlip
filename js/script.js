document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const adviceText = document.getElementById('adviceText');
    const loadingText = document.getElementById('loadingText');
    const prevButton = document.getElementById('prevButton');
    const refreshButton = document.getElementById('refreshButton');
    const nextButton = document.getElementById('nextButton');
    const resultInfo = document.getElementById('resultInfo');

    let currentAdvice = null;
    let searchResults = [];
    let currentIndex = 0;
    let isSearching = false;

    const fetchRandomAdvice = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();
            currentAdvice = { id: data.slip.id, advice: data.slip.advice };
            displayAdvice(currentAdvice.advice);
        } catch (error) {
            console.error('Error fetching advice:', error);
            displayAdvice('Failed to fetch advice. Please try again.');
        }
        setLoading(false);
    };

    const searchAdvice = async () => {
        const query = searchInput.value.trim();
        if (query === '') return;

        setLoading(true);
        isSearching = true;
        try {
            const response = await fetch(`https://api.adviceslip.com/advice/search/${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.slips) {
                searchResults = data.slips.map(slip => ({ id: slip.id, advice: slip.advice }));
                currentIndex = 0;
                displayAdvice(searchResults[currentIndex].advice);
                updateResultInfo();
            } else {
                searchResults = [];
                displayAdvice('No results found.');
                updateResultInfo();
            }
        } catch (error) {
            console.error('Error searching advice:', error);
            displayAdvice('Failed to search advice. Please try again.');
        }
        setLoading(false);
    };

    const displayAdvice = (text) => {
        adviceText.style.opacity = '0';
        adviceText.style.transform = 'translateX(20px)';
        setTimeout(() => {
            adviceText.textContent = text;
            adviceText.style.opacity = '1';
            adviceText.style.transform = 'translateX(0)';
        }, 200);
    };

    const setLoading = (isLoading) => {
        loadingText.style.display = isLoading ? 'block' : 'none';
        adviceText.style.display = isLoading ? 'none' : 'block';
    };

    const updateResultInfo = () => {
        if (isSearching) {
            resultInfo.textContent = `Showing result ${currentIndex + 1} of ${searchResults.length}`;
        } else {
            resultInfo.textContent = '';
        }
        prevButton.disabled = !isSearching || currentIndex === 0;
        nextButton.disabled = !isSearching || currentIndex === searchResults.length - 1;
    };

    searchButton.addEventListener('click', searchAdvice);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchAdvice();
    });

    prevButton.addEventListener('click', () => {
        if (isSearching && currentIndex > 0) {
            currentIndex--;
            displayAdvice(searchResults[currentIndex].advice);
            updateResultInfo();
        }
    });

    nextButton.addEventListener('click', () => {
        if (isSearching && currentIndex < searchResults.length - 1) {
            currentIndex++;
            displayAdvice(searchResults[currentIndex].advice);
            updateResultInfo();
        }
    });

    refreshButton.addEventListener('click', () => {
        isSearching = false;
        searchResults = [];
        currentIndex = 0;
        updateResultInfo();
        fetchRandomAdvice();
    });

    // Initial fetch
    fetchRandomAdvice();
});
