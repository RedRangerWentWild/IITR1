chrome.runtime.onInstalled.addListener(() => {
    console.log('EmailFlow Extension installed');
});

// Logic for handling cross-origin requests to the local backend if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CONVERT_DRAFT') {
        // Forward to backend
        fetch('http://localhost:3000/drafts/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
        })
            .then(r => r.json())
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true; // Keep channel open for async response
    }
});
