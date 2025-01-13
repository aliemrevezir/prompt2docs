# Prompt2Docs - Mozilla Add-ons Submission

## Extension Overview
Prompt2Docs is a Firefox extension that allows users to export chat conversations into JSON and Markdown formats. It's designed to help users save and document their chat interactions efficiently.

## Functionality
1. **Data Collection**:
   - Uses content scripts to collect chat data from the active tab
   - Collects only visible text content (prompts and responses)
   - No personal data is collected or stored

2. **Export Options**:
   - JSON format: Raw data with metadata
   - Markdown format: Formatted, readable documentation

3. **Permissions Used**:
   - `activeTab`: To access current page content
   - `downloads`: For saving exported files
   - `storage`: For future settings storage
   - `tabs`: For accessing tab information
   - `<all_urls>`: For content script injection

## Security Measures
1. No external API calls or remote resources
2. All processing happens locally
3. No data storage beyond the current session
4. No tracking or analytics

## Test Instructions
1. Install the extension
2. Navigate to any chat page
3. Click the extension icon
4. Try both export options:
   - "Export as JSON"
   - "Export as Markdown"
5. Verify the downloaded files contain the chat content

## Code Overview
- `manifest.json`: Extension configuration
- `popup/`: UI components
- `content.js`: Chat data extraction
- `background.js`: Message handling

## Development Notes
- Built with vanilla JavaScript
- No external dependencies
- Follows Mozilla's best practices
- MIT licensed

## Contact
For any questions during review, please contact through Mozilla Add-ons platform. 