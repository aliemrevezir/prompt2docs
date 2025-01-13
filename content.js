// Cross-browser compatibility
const browserAPI = window.chrome || window.browser;

// Platform-specific XPath patterns
const PLATFORM_PATTERNS = {
    chatgpt: {
        basePattern: {
            article: "/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article",
            promptSuffix: "/div/div/div/div/div/div/div/div/div[1]",
            responseSuffix: "/div/div/div[2]/div/div[1]/div/div/div"
        },
        imagePattern: {
            container: "/div/div/div[2]/div/div[1]",
            image: "/div[1]/div/div/div/div[2]/img",
            text: "/div[2]/div/div"
        },
        codePattern: {
            container: "/div/div/div[2]/div/div[1]/div/div/div",
            preBlock: "/pre",
            textBefore: "/text()[preceding-sibling::pre]",
            textAfter: "/text()[following-sibling::pre]"
        }
    }
};

// Helper function to generate XPath for nth article
function generateArticleXPath(n, type) {
    const base = PLATFORM_PATTERNS.chatgpt.basePattern;
    const articlePath = `${base.article}[${n}]`;
    
    if (type === 'prompt') {
        return `${articlePath}${base.promptSuffix}`;
    } else if (type === 'response') {
        return {
            container: `${articlePath}${base.responseSuffix}`,
            hasImage: `${articlePath}${PLATFORM_PATTERNS.chatgpt.imagePattern.container}${PLATFORM_PATTERNS.chatgpt.imagePattern.image}`,
            hasCode: `${articlePath}${base.responseSuffix}${PLATFORM_PATTERNS.chatgpt.codePattern.preBlock}`
        };
    } else if (type === 'imageResponse') {
        const imgPattern = PLATFORM_PATTERNS.chatgpt.imagePattern;
        return {
            container: `${articlePath}${imgPattern.container}`,
            image: `${articlePath}${imgPattern.container}${imgPattern.image}`,
            text: `${articlePath}${imgPattern.container}${imgPattern.text}`
        };
    } else if (type === 'codeResponse') {
        const codePattern = PLATFORM_PATTERNS.chatgpt.codePattern;
        return {
            container: `${articlePath}${codePattern.container}`,
            preBlock: `${articlePath}${codePattern.container}${codePattern.preBlock}`,
            textBefore: `${articlePath}${codePattern.container}${codePattern.textBefore}`,
            textAfter: `${articlePath}${codePattern.container}${codePattern.textAfter}`
        };
    }
    return null;
}

// Helper functions for DOM manipulation
function getTextContent(element) {
    if (!element) return '';
    return element.textContent.trim();
}

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
function getChatData(settings) {
    try {
        console.log('Getting chat data...');
        
        // Get all articles first to determine the conversation flow
        const articles = getElementsByXPath("/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article");
        console.log(`Found ${articles.length} articles`);

        const chatData = {
            metadata: {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                total_pairs: 0
            },
            prompts: []
        };

        // Process articles in pairs (prompt + response)
        for (let i = 0; i < articles.length - 1; i += 2) {
            const promptArticle = articles[i];
            const responseArticle = articles[i + 1];

            if (!promptArticle || !responseArticle) continue;

            // Get prompt text
            const promptText = getTextContent(getElementsByXPath(generateArticleXPath(i + 1, 'prompt'))[0]);
            
            // Get response
            const responseXPaths = generateArticleXPath(i + 2, 'response');
            let responseText = '';
            let imageUrl = '';
            let codeBlocks = [];

            // Check for image
            const hasImage = getElementsByXPath(responseXPaths.hasImage)[0];
            if (hasImage) {
                // Handle response with image
                const imageResponse = generateArticleXPath(i + 2, 'imageResponse');
                const imgElement = getElementsByXPath(imageResponse.image)[0];
                const textElement = getElementsByXPath(imageResponse.text)[0];
                
                if (imgElement) {
                    imageUrl = imgElement.src;
                }
                if (textElement) {
                    responseText = getTextContent(textElement);
                }
            } else {
                // Check for code blocks
                const hasCode = getElementsByXPath(responseXPaths.hasCode)[0];
                if (hasCode) {
                    // Handle response with code blocks
                    const codeResponse = generateArticleXPath(i + 2, 'codeResponse');
                    const preElements = getElementsByXPath(codeResponse.preBlock);
                    const textBefore = getTextContent(getElementsByXPath(codeResponse.textBefore)[0]);
                    const textAfter = getTextContent(getElementsByXPath(codeResponse.textAfter)[0]);

                    // Collect all code blocks
                    preElements.forEach(pre => {
                        codeBlocks.push(getTextContent(pre));
                    });

                    // Combine text and code blocks
                    responseText = [textBefore, ...codeBlocks, textAfter]
                        .filter(text => text.trim())
                        .join('\n\n');
                } else {
                    // Handle regular response
                    responseText = getTextContent(getElementsByXPath(responseXPaths.container)[0]);
                }
            }

            if (promptText || responseText) {
                chatData.prompts.push({
                    id: (i / 2) + 1,
                    timestamp: new Date().toISOString(),
                    prompt: promptText,
                    response: responseText,
                    ...(imageUrl && { image_url: imageUrl }),
                    ...(codeBlocks.length > 0 && { code_blocks: codeBlocks })
                });
                chatData.metadata.total_pairs++;
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
        const chatData = getChatData(request.settings);
        sendResponse(chatData);
    }
    
    return true; // Keep the message channel open for async response
});

