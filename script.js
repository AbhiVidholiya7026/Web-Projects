const MAX_WORDS = 2000;

function updateWordCount() {
    const text = document.getElementById('inputText').value;
    const wordCountElement = document.getElementById('wordCount');
    const summarizeBtn = document.querySelector('.summarize-btn');
    
    // Split text by whitespace and filter out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    wordCountElement.innerText = `${wordCount} / ${MAX_WORDS} words`;
    
    // Update styling and button state
    if (wordCount > MAX_WORDS) {
        wordCountElement.classList.add('exceeded');
        summarizeBtn.disabled = true;
    } else {
        wordCountElement.classList.remove('exceeded');
        summarizeBtn.disabled = false;
    }
}

async function summarizeText() {
    const text = document.getElementById('inputText').value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length > MAX_WORDS) {
        alert(`Text exceeds ${MAX_WORDS} words. Please shorten it.`);
        return;
    }

    const summaryOutput = document.getElementById('summaryContent');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const summarizeBtn = document.querySelector('.summarize-btn');

    // Show loading spinner, disable button
    loadingSpinner.style.display = 'block';
    summarizeBtn.disabled = true;
    summarizeBtn.innerText = 'Summarizing...';
    summaryOutput.style.display = 'none';

    try {
        const response = await fetch('http://localhost:5001/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();

        if (data.summary) {
            summaryOutput.innerText = data.summary;
            summaryOutput.style.display = 'block';
        } else {
            summaryOutput.innerText = 'Error: ' + (data.error || 'Unknown error');
            summaryOutput.style.display = 'block';
        }
    } catch (error) {
        summaryOutput.innerText = 'Failed to connect to server: ' + error.message;
        summaryOutput.style.display = 'block';
    } finally {
        loadingSpinner.style.display = 'none';
        summarizeBtn.disabled = false;
        summarizeBtn.innerText = 'Summarize';
    }
}

function toggleSummary() {
    const content = document.getElementById('summaryContent');
    const toggleBtn = document.querySelector('.toggle-btn');
    const isHidden = content.style.display === 'none' || content.style.display === '';

    content.style.display = isHidden ? 'block' : 'none';
    toggleBtn.innerText = isHidden ? 'Hide Summary' : 'Show Summary';
}

// Add event listener for real-time word counting
document.getElementById('inputText').addEventListener('input', updateWordCount);

// Initialize word count on page load
updateWordCount();