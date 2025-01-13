// Cross-browser compatibility
const browserAPI = window.chrome || window.browser;

// Default settings
const DEFAULT_SETTINGS = {
    platform: 'chatgpt',
    useCustomXPath: false,
    promptXPath: '',
    responseXPath: '',
    includeMetadata: true,
    includeTimestamps: true,
    includeConversationNumbers: true,
    useCodeBlocks: true,
    addSeparators: true,
    useEmojis: true,
    autoFilename: true,
    prettyPrintJson: true,
    includeLineBreaks: true,
    useCustomLabels: false,
    userLabel: 'User',
    assistantLabel: 'Assistant',
    includePrompts: true,
    includeResponses: true
};

// Platform-specific XPath patterns
const PLATFORM_PATTERNS = {
    chatgpt: {
        prompt: "/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div/div/div/div/div/div/div[1]",
        response: "/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article/div/div/div[2]/div/div[1]/div/div/div"
    }
};

// Function to handle button state
function setButtonState(button, isLoading) {
    const originalText = button.getAttribute('data-original-text') || button.textContent;
    if (isLoading) {
        button.setAttribute('data-original-text', originalText);
        button.textContent = "Exporting...";
        button.disabled = true;
    } else {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Function to show success message
function showSuccess(button) {
    const originalText = button.getAttribute('data-original-text') || button.textContent;
    button.textContent = "Success!";
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Function to convert JSON data to markdown
function convertToMarkdown(data, settings) {
    try {
        let markdown = `# Prompt2Docs Export\n\n`;
        
        // Add metadata section if enabled
        if (settings.includeMetadata) {
            markdown += `## Metadata\n\n`;
            markdown += `- **Source URL**: ${data.metadata.url}\n`;
            if (settings.includeTimestamps) {
                markdown += `- **Export Time**: ${new Date(data.metadata.timestamp).toLocaleString()}\n`;
            }
            markdown += `- **Total Conversations**: ${data.metadata.total_pairs}\n\n`;
        }
        
        // Add conversations
        markdown += `## Conversations\n\n`;
        
        data.prompts.forEach((item, index) => {
            // Add conversation header with ID if enabled
            if (settings.includeConversationNumbers) {
                markdown += `### Conversation ${item.id}\n`;
            } else {
                markdown += `### Chat Entry\n`;
            }
            
            // Add timestamp if enabled
            if (settings.includeTimestamps && item.timestamp) {
                markdown += `*Recorded at: ${new Date(item.timestamp).toLocaleString()}*\n\n`;
            }
            
            // Add user prompt if enabled
            if (settings.includePrompts) {
                const userLabel = settings.useCustomLabels ? settings.userLabel : 'User';
                markdown += `#### ${settings.useEmojis ? '👤 ' : ''}${userLabel}\n\n`;
                
                if (settings.useCodeBlocks) {
                    markdown += `\`\`\`\n${item.prompt}\n\`\`\`\n\n`;
                } else {
                    markdown += `${item.prompt}\n\n`;
                }
            }
            
            // Add assistant response if enabled
            if (settings.includeResponses) {
                const assistantLabel = settings.useCustomLabels ? settings.assistantLabel : 'Assistant';
                markdown += `#### ${settings.useEmojis ? '🤖 ' : ''}${assistantLabel}\n\n`;
                
                if (settings.useCodeBlocks) {
                    markdown += `\`\`\`\n${item.response}\n\`\`\`\n\n`;
                } else {
                    markdown += `${item.response}\n\n`;
                }
            }
            
            // Add separator if enabled and not the last item
            if (settings.addSeparators && index < data.prompts.length - 1) {
                markdown += `---\n\n`;
            }
        });
        
        return markdown;
    } catch (error) {
        console.error("Error converting to markdown:", error);
        throw error;
    }
}

// Function to download markdown
function downloadMarkdown(markdown, settings) {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = settings.autoFilename 
        ? `prompt2docs_export_${timestamp}.md`
        : 'prompt2docs_export.md';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
}

// Function to download JSON
function downloadJSON(data, settings) {
    // Create a copy of the data to modify
    let exportData = JSON.parse(JSON.stringify(data));
    
    // Remove metadata if not included
    if (!settings.includeMetadata) {
        delete exportData.metadata;
    }
    
    // Remove timestamps if not included
    if (!settings.includeTimestamps) {
        if (exportData.metadata) {
            delete exportData.metadata.timestamp;
        }
        exportData.prompts = exportData.prompts.map(({ timestamp, ...rest }) => rest);
    }
    
    // Remove conversation numbers if not included
    if (!settings.includeConversationNumbers) {
        exportData.prompts = exportData.prompts.map(({ id, ...rest }) => rest);
    }
    
    // Filter out prompts or responses based on settings
    exportData.prompts = exportData.prompts.map(item => {
        let newItem = {};
        if (settings.includePrompts) {
            newItem.prompt = item.prompt;
        }
        if (settings.includeResponses) {
            newItem.response = item.response;
        }
        if (settings.includeConversationNumbers) {
            newItem.id = item.id;
        }
        if (settings.includeTimestamps && item.timestamp) {
            newItem.timestamp = item.timestamp;
        }
        return newItem;
    });
    
    // Format JSON string
    const jsonString = settings.prettyPrintJson 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = settings.autoFilename 
        ? `chat_data_${timestamp}.json`
        : 'chat_data.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
}

// Add notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to validate XPath
function isValidXPath(xpath) {
    try {
        document.createExpression(xpath);
        return true;
    } catch (e) {
        return false;
    }
}

// Function to test XPath selectors
async function testXPathSelectors() {
    const settings = {
        useCustomXPath: document.getElementById('use-custom-xpath').checked,
        promptXPath: document.getElementById('prompt-xpath').value,
        responseXPath: document.getElementById('response-xpath').value,
        platform: document.getElementById('platform-select').value
    };
    
    const patterns = getXPathPatterns(settings);
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'testXPath',
            promptXPath: patterns.prompt,
            responseXPath: patterns.response
        });
        
        if (response.success) {
            showNotification(`Found ${response.promptCount} prompts and ${response.responseCount} responses`, 'success');
        } else {
            showNotification(response.error || 'Failed to test XPath selectors', 'error');
        }
    } catch (error) {
        showNotification('Error testing XPath selectors', 'error');
    }
}

// Function to handle export request
function handleExport(type) {
    const button = document.getElementById(`export-${type}`);
    setButtonState(button, true);

    // First get the settings
    const storage = browserAPI.storage.local || browserAPI.storage.sync;
    storage.get('settings', (settingsData) => {
        const settings = { ...DEFAULT_SETTINGS, ...settingsData.settings };

        // Validate XPath if custom is enabled
        if (settings.useCustomXPath) {
            if (!settings.promptXPath || !settings.responseXPath) {
                showNotification('Please enter both XPath selectors before exporting.', 'error');
                setButtonState(button, false);
                return;
            }
            if (!isValidXPath(settings.promptXPath) || !isValidXPath(settings.responseXPath)) {
                showNotification('Invalid XPath syntax. Please check your selectors.', 'error');
                setButtonState(button, false);
                return;
            }
        }

        // Then get the chat data with custom XPath if enabled
        const message = {
            action: "getChatData"
        };

        if (settings.useCustomXPath && settings.promptXPath && settings.responseXPath) {
            message.promptXPath = settings.promptXPath;
            message.responseXPath = settings.responseXPath;
        }

        chrome.runtime.sendMessage(message, (response) => {
            setButtonState(button, false);

            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                showNotification("Error communicating with the extension. Please refresh the page.", 'error');
                return;
            }

            if (!response) {
                showNotification("No response from the page. Please refresh and try again.", 'error');
                return;
            }

            try {
                if (type === 'md') {
                    if (!response.metadata || !response.prompts) {
                        throw new Error("Invalid data format");
                    }
                    const markdown = convertToMarkdown(response, settings);
                    downloadMarkdown(markdown, settings);
                } else if (type === 'json') {
                    downloadJSON(response, settings);
                }
                showNotification(`Successfully exported as ${type.toUpperCase()}!`, 'success');
            } catch (error) {
                console.error(`Error exporting as ${type}:`, error);
                console.error("Response data:", response);
                showNotification(`Failed to export as ${type}. Please try again.`, 'error');
            }
        });
    });
}

// Export button click handlers
document.getElementById("export-json").addEventListener("click", () => handleExport('json'));
document.getElementById("export-md").addEventListener("click", () => handleExport('md'));

// Settings modal functionality
const modal = document.getElementById('settings-modal');
const openModalBtn = document.getElementById('customize-settings');
const closeModalBtn = document.querySelector('.close-modal');
const saveSettingsBtn = document.getElementById('save-settings');

// Function to open modal
function openModal() {
    console.log('Opening settings modal');
    modal.classList.add('show');
    loadSettings();
}

// Function to close modal
function closeModal() {
    console.log('Closing settings modal');
    modal.classList.remove('show');
}

// Function to save settings
function saveSettings() {
    console.log('Saving settings...');
    const settings = {
        platform: document.getElementById('platform-select').value,
        useCustomXPath: document.getElementById('use-custom-xpath').checked,
        promptXPath: document.getElementById('prompt-xpath').value,
        responseXPath: document.getElementById('response-xpath').value,
        includeMetadata: document.getElementById('include-metadata').checked,
        includeTimestamps: document.getElementById('include-timestamps').checked,
        includeConversationNumbers: document.getElementById('include-conversation-numbers').checked,
        useCodeBlocks: document.getElementById('use-code-blocks').checked,
        addSeparators: document.getElementById('add-separators').checked,
        useEmojis: document.getElementById('use-emojis').checked,
        autoFilename: document.getElementById('auto-filename').checked,
        prettyPrintJson: document.getElementById('pretty-print-json').checked,
        includeLineBreaks: document.getElementById('include-line-breaks').checked,
        useCustomLabels: document.getElementById('use-custom-labels').checked,
        userLabel: document.getElementById('user-label').value.trim() || 'User',
        assistantLabel: document.getElementById('assistant-label').value.trim() || 'Assistant',
        includePrompts: document.getElementById('include-prompts').checked,
        includeResponses: document.getElementById('include-responses').checked
    };

    // Validate that at least one content type is selected
    if (!settings.includePrompts && !settings.includeResponses) {
        showNotification('Please select at least one content type to export (prompts or responses)', 'error');
        return;
    }

    console.log('Settings to save:', settings);

    try {
        const storage = browserAPI.storage.local || browserAPI.storage.sync;
        storage.set({ settings }, () => {
            if (browserAPI.runtime.lastError) {
                console.error('Error saving settings:', browserAPI.runtime.lastError);
                showNotification('Failed to save settings', 'error');
                return;
            }
            console.log('Settings saved successfully');
            showNotification('Settings saved successfully', 'success');
            setTimeout(closeModal, 1000);
        });
    } catch (error) {
        console.error('Error in saveSettings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

// Function to load settings
function loadSettings() {
    console.log('Loading settings...');
    try {
        const storage = browserAPI.storage.local || browserAPI.storage.sync;
        storage.get('settings', (data) => {
            if (browserAPI.runtime.lastError) {
                console.error('Error loading settings:', browserAPI.runtime.lastError);
                return;
            }

            const settings = { ...DEFAULT_SETTINGS, ...data.settings };
            console.log('Loaded settings:', settings);

            // Platform settings
            document.getElementById('platform-select').value = settings.platform;
            
            // XPath settings
            document.getElementById('use-custom-xpath').checked = settings.useCustomXPath;
            document.getElementById('prompt-xpath').value = settings.promptXPath;
            document.getElementById('response-xpath').value = settings.responseXPath;
            document.getElementById('xpath-section').style.display = settings.useCustomXPath ? 'block' : 'none';

            // Content settings
            document.getElementById('include-prompts').checked = settings.includePrompts;
            document.getElementById('include-responses').checked = settings.includeResponses;
            document.getElementById('include-metadata').checked = settings.includeMetadata;
            document.getElementById('include-timestamps').checked = settings.includeTimestamps;
            document.getElementById('include-conversation-numbers').checked = settings.includeConversationNumbers;

            // Markdown formatting
            document.getElementById('use-code-blocks').checked = settings.useCodeBlocks;
            document.getElementById('add-separators').checked = settings.addSeparators;
            document.getElementById('use-emojis').checked = settings.useEmojis;

            // Export options
            document.getElementById('auto-filename').checked = settings.autoFilename;
            document.getElementById('pretty-print-json').checked = settings.prettyPrintJson;
            document.getElementById('include-line-breaks').checked = settings.includeLineBreaks;

            // Custom labels
            document.getElementById('use-custom-labels').checked = settings.useCustomLabels;
            document.getElementById('user-label').value = settings.userLabel;
            document.getElementById('assistant-label').value = settings.assistantLabel;
            document.getElementById('custom-label-section').style.display = settings.useCustomLabels ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Error in loadSettings:', error);
        showNotification('Error loading settings', 'error');
    }
}

// Function to reset settings
function resetSettings() {
    console.log('Resetting settings to default...');
    try {
        const storage = browserAPI.storage.local || browserAPI.storage.sync;
        storage.set({ settings: DEFAULT_SETTINGS }, () => {
            if (browserAPI.runtime.lastError) {
                console.error('Error resetting settings:', browserAPI.runtime.lastError);
                showNotification('Failed to reset settings', 'error');
                return;
            }
            loadSettings();
            showNotification('Settings reset to default', 'success');
        });
    } catch (error) {
        console.error('Error in resetSettings:', error);
        showNotification('Failed to reset settings', 'error');
    }
}

// Add reset button event listener
document.getElementById('reset-settings').addEventListener('click', resetSettings);

// Add custom labels toggle handler
document.getElementById('use-custom-labels').addEventListener('change', function() {
    const customLabelSection = document.getElementById('custom-label-section');
    customLabelSection.style.display = this.checked ? 'block' : 'none';
});

// Add XPath toggle handler
document.getElementById('use-custom-xpath').addEventListener('change', function() {
    const xpathSection = document.getElementById('xpath-section');
    xpathSection.style.display = this.checked ? 'block' : 'none';
});

// Add test XPath button handler
document.getElementById('test-xpath').addEventListener('click', testXPathSelectors);

// Event listeners for modal
openModalBtn.addEventListener('click', () => {
    console.log('Settings button clicked');
    openModal();
});

closeModalBtn.addEventListener('click', () => {
    console.log('Close button clicked');
    closeModal();
});

saveSettingsBtn.addEventListener('click', () => {
    console.log('Save button clicked');
    saveSettings();
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        console.log('Clicked outside modal');
        closeModal();
    }
});

// Get XPath patterns based on platform
function getXPathPatterns(settings) {
    if (settings.useCustomXPath) {
        return {
            prompt: settings.promptXPath,
            response: settings.responseXPath
        };
    }
    
    return PLATFORM_PATTERNS[settings.platform] || PLATFORM_PATTERNS.chatgpt;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Event listeners
    document.getElementById('export-json').addEventListener('click', () => handleExport('json'));
    document.getElementById('export-md').addEventListener('click', () => handleExport('md'));
    document.getElementById('customize-settings').addEventListener('click', () => {
        modal.classList.add('show');
    });
    document.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    document.getElementById('save-settings').addEventListener('click', () => {
        saveSettings();
        modal.classList.remove('show');
    });
    document.getElementById('test-xpath').addEventListener('click', testXPathSelectors);
    document.getElementById('use-custom-xpath').addEventListener('change', (e) => {
        const xpathInputs = document.getElementById('xpath-inputs');
        xpathInputs.style.display = e.target.checked ? 'block' : 'none';
    });
    document.getElementById('platform-select').addEventListener('change', (e) => {
        const useCustomXPath = document.getElementById('use-custom-xpath');
        if (!useCustomXPath.checked) {
            const patterns = PLATFORM_PATTERNS[e.target.value] || PLATFORM_PATTERNS.chatgpt;
            document.getElementById('prompt-xpath').value = patterns.prompt;
            document.getElementById('response-xpath').value = patterns.response;
        }
    });
});
