// Cross-browser compatibility
const browserAPI = window.chrome || window.browser;

// Helper function to safely get text content
function getTextContent(element) {
    return element ? element.textContent.trim() : '';
}

// Helper function to get elements by XPath
function getElementsByXPath(xpath) {
    const elements = [];
    try {
        const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        
        for (let i = 0; i < result.snapshotLength; i++) {
            elements.push(result.snapshotItem(i));
        }
    } catch (error) {
        console.error('XPath evaluation error:', error);
    }
    return elements;
}

// Function to get chat data using XPath
function getChatData() {
    let chatData = {
        metadata: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            total_pairs: 0
        },
        prompts: []
    };
    
    try {
        // Use the specific XPath selectors but modified to get all matches
        const promptXPath = '//div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div/div/div/div/div/div/div[1]';
        const responseXPath = '//div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div[2]/div/div[1]/div/div/div';
        
        const promptElements = getElementsByXPath(promptXPath);
        const responseElements = getElementsByXPath(responseXPath);

        // Process all found prompt-response pairs
        promptElements.forEach((promptElement, index) => {
            const responseElement = responseElements[index];
            if (promptElement && responseElement) {
                const promptText = getTextContent(promptElement);
                const responseText = getTextContent(responseElement);

                // Create chat data object with ID
                chatData.prompts.push({
                    id: `prompt_${index + 1}`,
                    prompt: promptText,
                    response: responseText,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Update total pairs
        chatData.metadata.total_pairs = chatData.prompts.length;

        if (chatData.prompts.length === 0) {
            console.warn('No content found at specified XPath locations');
            return { success: false, message: "No content found at specified locations" };
        }

        return chatData; // Return the entire chatData object

    } catch (error) {
        console.error("Error getting chat data:", error);
        return { success: false, message: error.message };
    }
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getChatData") {
        const result = getChatData();
        sendResponse(result);
    }
    return true; // Required for async response
});
