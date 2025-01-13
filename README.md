# Prompt2Docs

A browser extension that allows you to effortlessly export your chat prompts and responses into JSON and Markdown formats.

## Features

- 🚀 Modern, clean interface
- 📝 Export conversations to JSON format
- 📘 Export conversations to Markdown format
- 🎯 Precise XPath-based content extraction
- 🔄 Cross-browser compatibility
- ⚡ Lightweight and fast
- 🎨 Customizable settings (coming soon)

## Installation

### Development Version
1. Clone this repository
   ```bash
   git clone https://github.com/aliemrevezir/prompt2docs.git
   ```
2. Open Firefox
3. Navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the project directory

### Production Version
*(Coming soon to Firefox Add-ons)*

## Usage

1. Navigate to a webpage with chat content
2. Click the Prompt2Docs icon in your browser toolbar
3. Choose your export format:
   - **JSON**: Raw data format, perfect for processing
   - **Markdown**: Readable format with proper formatting
4. Find your exported file in your downloads folder

## Project Structure

```
prompt2docs/
├── assets/               # Icons and images
│   ├── icon16.png //Temporary
│   ├── icon48.png //Temporary
│   └── icon128.png //Temporary
├── popup/               # Extension popup interface
│   ├── popup.html      # Popup structure
│   ├── popup.css       # Styles
│   └── popup.js        # Popup logic
├── background.js       # Background script
├── content.js          # Content script for data extraction
├── manifest.json       # Extension manifest
└── README.md          # Documentation
```

## Technical Details

- **Version**: 1.0.0
- **Browser Support**: Firefox (Inspired by [Chat2Docs](https://chromewebstore.google.com/detail/chat2docs/badapebhjdmiohmfigjjefpfnnilghgf?hl=en).)
- **Manifest Version**: 2
- **Permissions**:
  - `activeTab`: For accessing current page content
  - `downloads`: For saving exported files
  - `storage`: For saving user preferences

### Data Format

#### JSON Output
```json
{
  "metadata": {
    "url": "page_url",
    "timestamp": "ISO-8601-timestamp",
    "total_pairs": 1
  },
  "prompts": [
    {
      "id": "prompt_1",
      "prompt": "User's question",
      "response": "AI's response",
      "timestamp": "ISO-8601-timestamp"
    }
  ]
}
```

#### Markdown Output
```markdown
# Prompt2Docs Export

## Metadata
- **Source URL**: page_url
- **Export Time**: timestamp
- **Total Conversations**: count

## Conversations

### prompt_1
*Recorded at: timestamp*

#### Prompt
```prompt text```

#### Response
```response text```
```

## Development

### Conventions
- Data exchange in JSON format
- Snake_case for variable naming
- CamelCase for file names
- External CSS and JavaScript files
- Git version control

### Setup Development Environment
1. Install Firefox Developer Edition (recommended)
2. Clone the repository
3. Load the extension in Firefox
4. Make your changes
5. Test thoroughly

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Roadmap
- [ ] Customizable export settings
- [ ] Additional export formats
- [ ] Custom XPath configuration
- [ ] Auto-detection of chat interfaces
- [ ] Export history tracking

## TODO
### High Priority
- [ ] Add PDF export functionality
- [ ] Improve XPath selectors for better content detection
- [ ] Add error handling for failed content extraction
- [ ] Create proper extension icons and branding
- [ ] Add support for different chat interfaces

### Features
- [ ] Add support for custom templates in Markdown export
- [ ] Implement settings page for customization
- [ ] Add batch export functionality
- [ ] Create export history viewer
- [ ] Add search functionality in exported content

### Technical Improvements
- [ ] Implement proper TypeScript support
- [ ] Add unit tests for core functionality
- [ ] Improve code documentation
- [ ] Set up CI/CD pipeline
- [ ] Add code quality checks (ESLint, Prettier)

### Documentation
- [ ] Create detailed API documentation
- [ ] Add troubleshooting guide
- [ ] Create user guide with examples
- [ ] Add contribution guidelines
- [ ] Create changelog

### Testing
- [ ] Add end-to-end tests
- [ ] Test on different chat platforms
- [ ] Cross-browser compatibility testing
- [ ] Performance testing
- [ ] Security audit

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Firefox WebExtensions API
- Uses jsPDF for future PDF export functionality
- Inspired by the need for better chat data portability 


Case 1(Response include image):
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[1]/div/div/div/div/div/div/div/div
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[2]/div/div //It contains image and response together.

/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[2]/div/div/div[2]/div/div[1]/div[1]/div/div/div/div[2]/img //Image's XPATH
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[2]/div/div/div[2]/div/div[1]/div[2]/div/div //Response XPATH


/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[5]/div/div/div/div/div/div/div/div/div[1] //Prompt
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[7]/div/div/div/div/div/div/div/div/div[1] //Next Prompt
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[8]/div/div/div[2]/div/div[1]/div[2]/div/div //response
/html/body/div[1]/div[2]/main/div[1]/div[1]/div/div/div/div/article[10]/div/div/div[2]/div/div[1]/div/div/div //next response


These are some examples for xpath