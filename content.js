// Cross-browser compatibility
const browserAPI = window.chrome || window.browser;

// Helper function to safely get text content
function getTextContent(element) {
    if (!element) return '';
    return element.textContent.trim();
}

// Helper function to get elements by XPath
function getElementsByXPath(xpath) {
    try {
        const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
            elements.push(result.snapshotItem(i));
        }
        return elements;
    } catch (error) {
        console.error('XPath evaluation error:', error);
        return [];
    }
}

// Function to get chat data
function getChatData(customPromptXPath, customResponseXPath) {
    try {
        console.log('Getting chat data with XPath:', { customPromptXPath, customResponseXPath });
        
        let promptElements = [];
        let responseElements = [];
        
        // Try custom XPath if provided
        if (customPromptXPath && customResponseXPath) {
            console.log('Using custom XPath selectors');
            promptElements = getElementsByXPath(customPromptXPath);
            responseElements = getElementsByXPath(customResponseXPath);
            
            console.log('Custom XPath results:', {
                promptCount: promptElements.length,
                responseCount: responseElements.length
            });
        }
        
        // If custom XPath failed or wasn't provided, try default patterns
        if (promptElements.length === 0 || responseElements.length === 0) {
            console.log('Trying default XPath patterns');
            
            // Default XPath patterns in order of specificity
            const defaultPatterns = [
                // Bing AI patterns
                {
                    prompt: "/html/body/div/main/div[2]/div/div/div[2]/div[2]/div[1]/div/div",
                    response: "/html/body/div/main/div[2]/div/div/div[2]/div[2]/div[2]/div/p/span"
                },
                // Claude patterns
                {
                    prompt: "/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div/div/div/div/div/div/div[1]",
                    response: "/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div[2]/div/div[1]/div/div/div"
                },
                // Generic class-based patterns
                {
                    prompt: "//div[contains(@class, 'conversation')]//div[contains(@class, 'user')]",
                    response: "//div[contains(@class, 'conversation')]//div[contains(@class, 'assistant')]"
                },
                {
                    prompt: "//main//article//div[contains(@class, 'prose')]",
                    response: "//main//article//div[contains(@class, 'prose')]"
                },
                // Bing AI class-based patterns
                {
                    prompt: "//div[contains(@class, 'user-message')]",
                    response: "//div[contains(@class, 'bot-message')]"
                },
                // Additional fallback patterns
                {
                    prompt: "//div[contains(@class, 'message')]//div[contains(@class, 'user')]",
                    response: "//div[contains(@class, 'message')]//div[contains(@class, 'assistant')]"
                }
            ];
            
            // Try each pattern until we find matches
            for (const pattern of defaultPatterns) {
                console.log('Trying pattern:', pattern);
                
                promptElements = getElementsByXPath(pattern.prompt);
                responseElements = getElementsByXPath(pattern.response);
                
                console.log('Pattern results:', {
                    promptCount: promptElements.length,
                    responseCount: responseElements.length
                });
                
                if (promptElements.length > 0 && responseElements.length > 0) {
                    console.log('Found matching elements with pattern:', pattern);
                    break;
                }
            }
        }
        
        console.log('Final element counts:', {
            promptCount: promptElements.length,
            responseCount: responseElements.length
        });
        
        if (promptElements.length === 0 || responseElements.length === 0) {
            console.log('No content found with any patterns');
            return {
                error: "No content found. Please check your XPath selectors or try a different pattern."
            };
        }

        const chatData = {
            metadata: {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                total_pairs: Math.min(promptElements.length, responseElements.length)
            },
            prompts: []
        };

        // Get the minimum length to avoid index errors
        const minLength = Math.min(promptElements.length, responseElements.length);
        
        for (let i = 0; i < minLength; i++) {
            const promptText = getTextContent(promptElements[i]);
            const responseText = getTextContent(responseElements[i]);
            
            if (promptText || responseText) {  // Only add if either prompt or response has content
                console.log(`Processing pair ${i + 1}:`, {
                    prompt: promptText.substring(0, 50) + (promptText.length > 50 ? '...' : ''),
                    response: responseText.substring(0, 50) + (responseText.length > 50 ? '...' : '')
                });
                
                chatData.prompts.push({
                    id: i + 1,
                    timestamp: new Date().toISOString(),
                    prompt: promptText,
                    response: responseText
                });
            }
        }

        if (chatData.prompts.length === 0) {
            return {
                error: "No valid prompt-response pairs found in the content."
            };
        }

        return chatData;
    } catch (error) {
        console.error('Error in getChatData:', error);
        return {
            error: error.message || "Failed to extract chat data"
        };
    }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    
    if (request.action === "getChatData") {
        const chatData = getChatData(request.promptXPath, request.responseXPath);
        sendResponse(chatData);
    } else if (request.action === "testXPath") {
        try {
            const promptElements = getElementsByXPath(request.promptXPath);
            const responseElements = getElementsByXPath(request.responseXPath);
            
            const result = {
                success: true,
                promptCount: promptElements.length,
                responseCount: responseElements.length,
                promptPreview: promptElements.length > 0 ? getTextContent(promptElements[0]).substring(0, 100) : '',
                responsePreview: responseElements.length > 0 ? getTextContent(responseElements[0]).substring(0, 100) : ''
            };
            
            console.log('XPath test results:', result);
            sendResponse(result);
        } catch (error) {
            console.error('Error testing XPath:', error);
            sendResponse({
                success: false,
                error: error.message || "Failed to test XPath selectors"
            });
        }
    }
    
    return true; // Keep the message channel open for async response
});
