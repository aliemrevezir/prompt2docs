// Cross-browser compatibility
const browserAPI = window.chrome || window.browser;

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
    const originalText = button.getAttribute('data-original-text');
    button.textContent = "Exported!";
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Function to convert data to markdown
function convertToMarkdown(data) {
    try {
        let markdown = `# Prompt2Docs Export\n\n`;
        
        // Add metadata section if available
        if (data.metadata) {
            markdown += `## Metadata\n\n`;
            markdown += `- **Source URL**: ${data.metadata.url}\n`;
            markdown += `- **Export Time**: ${new Date(data.metadata.timestamp).toLocaleString()}\n`;
            markdown += `- **Total Conversations**: ${data.metadata.total_pairs}\n\n`;
        }
        
        // Add conversations
        markdown += `## Conversations\n\n`;
        
        if (data.prompts && Array.isArray(data.prompts)) {
            data.prompts.forEach((item) => {
                // Add conversation header with ID and timestamp
                markdown += `### ${item.id}\n`;
                if (item.timestamp) {
                    markdown += `*Recorded at: ${new Date(item.timestamp).toLocaleString()}*\n\n`;
                }
                
                // Add prompt
                markdown += `#### Prompt\n\n`;
                markdown += `\`\`\`\n${item.prompt}\n\`\`\`\n\n`;
                
                // Add response
                markdown += `#### Response\n\n`;
                markdown += `\`\`\`\n${item.response}\n\`\`\`\n\n`;
                
                // Add separator
                markdown += `---\n\n`;
            });
        } else {
            throw new Error("Invalid data format: prompts array not found");
        }
        
        return markdown;
    } catch (error) {
        console.error("Error converting to markdown:", error);
        console.error("Data received:", data);
        throw error;
    }
}

// Function to download markdown
function downloadMarkdown(markdown) {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `prompt2docs_export_${timestamp}.md`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
}

// Function to download JSON
function downloadJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `chat_data_${timestamp}.json`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
}

// Function to handle export request
function handleExport(type) {
    const button = document.getElementById(`export-${type}`);
    setButtonState(button, true);

    chrome.runtime.sendMessage({ action: "getChatData" }, (response) => {
        setButtonState(button, false);

        if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            alert("Error communicating with the extension. Please try refreshing the page.");
            return;
        }

        if (!response) {
            alert("No response from the page. Please refresh and try again.");
            return;
        }

        try {
            if (type === 'md') {
                const markdown = convertToMarkdown(response);
                downloadMarkdown(markdown);
            } else if (type === 'json') {
                downloadJSON(response);
            }
            showSuccess(button);
        } catch (error) {
            console.error(`Error exporting as ${type}:`, error);
            console.error("Response data:", response);
            alert(`Failed to export as ${type}. Please try again.`);
        }
    });
}

// Export button click handlers
document.getElementById("export-json").addEventListener("click", () => handleExport('json'));
document.getElementById("export-md").addEventListener("click", () => handleExport('md'));

// Settings button click handler
document.getElementById("customize-settings").addEventListener("click", () => {
    alert("Settings feature coming soon!");
});
