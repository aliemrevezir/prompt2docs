// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Prompt2Docs extension installed');
});

// Handle messages from popup to content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getChatData") {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0]) {
                sendResponse({ success: false, message: "No active tab found" });
                return;
            }

            // Send message to content script
            chrome.tabs.sendMessage(tabs[0].id, { action: "getChatData" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    sendResponse({ 
                        success: false, 
                        message: "Could not communicate with page. Please refresh and try again."
                    });
                    return;
                }

                // Forward the response directly
                sendResponse(response);
            });
        });
        return true; // Will respond asynchronously
    }
});
