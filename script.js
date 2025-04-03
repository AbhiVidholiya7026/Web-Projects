function getMaxWords() {
    const maxWordsInput = document.getElementById('maxWords');
    let maxWords = parseInt(maxWordsInput.value, 10);
    if (isNaN(maxWords) || maxWords < 100 || maxWords > 5000) {
        maxWords = 2000;
        maxWordsInput.value = maxWords;
    }
    return maxWords;
}

function updateWordCount() {
    const text = document.getElementById('inputText').value;
    const wordCountElement = document.getElementById('wordCount');
    const summarizeBtn = document.querySelector('.summarize-btn');
    const textarea = document.getElementById('inputText');
    const progressBar = document.getElementById('progressBar');
    const maxWords = getMaxWords();
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    wordCountElement.innerText = `${wordCount} / ${maxWords} words`;
    const progressPercent = Math.min((wordCount / maxWords) * 100, 100);
    progressBar.style.setProperty('--progress-width', `${progressPercent}%`);
    
    if (wordCount > maxWords) {
        wordCountElement.classList.add('exceeded');
        summarizeBtn.disabled = true;
        textarea.classList.add('shake');
        setTimeout(() => textarea.classList.remove('shake'), 500);
    } else {
        wordCountElement.classList.remove('exceeded');
        summarizeBtn.disabled = false;
        textarea.classList.remove('shake');
    }
}

async function summarizeText() {
    const text = document.getElementById('inputText').value;
    const maxWords = getMaxWords();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length > maxWords) {
        const textarea = document.getElementById('inputText');
        textarea.classList.add('shake');
        setTimeout(() => textarea.classList.remove('shake'), 500);
        alert(`Text exceeds ${maxWords} words. Please shorten it.`);
        return;
    }

    const summaryOutput = document.getElementById('summaryContent');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const summarizeBtn = document.querySelector('.summarize-btn');
    const copyBtn = document.querySelector('.copy-btn');

    loadingSpinner.style.display = 'block';
    summarizeBtn.disabled = true;
    summarizeBtn.innerText = 'Summarizing...';
    summaryOutput.style.display = 'none';
    copyBtn.style.display = 'none';

    try {
        const response = await fetch('http://localhost:5001/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (data.summary) {
            summaryOutput.innerText = data.summary;
            summaryOutput.style.display = 'block';
            copyBtn.style.display = 'inline-block';
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

function clearText() {
    const textarea = document.getElementById('inputText');
    textarea.value = '';
    updateWordCount();
    const summaryOutput = document.getElementById('summaryContent');
    const copyBtn = document.querySelector('.copy-btn');
    summaryOutput.style.display = 'none';
    copyBtn.style.display = 'none';
}

function copySummary() {
    const summary = document.getElementById('summaryContent').innerText;
    navigator.clipboard.writeText(summary).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.innerText = 'Copied!';
        setTimeout(() => copyBtn.innerText = 'Copy', 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err.message);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    toggleBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Event listeners
document.getElementById('inputText').addEventListener('input', updateWordCount);
document.getElementById('maxWords').addEventListener('input', updateWordCount);

// Initialize
updateWordCount();
