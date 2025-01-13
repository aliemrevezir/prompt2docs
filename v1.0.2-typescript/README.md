# Prompt2Docs

A browser extension that allows you to effortlessly export your chat prompts and responses into JSON and Markdown formats, now rewritten in TypeScript for better type safety and maintainability.

## Features

- 🚀 Modern, clean interface
- 📝 Export conversations to JSON format
- 📘 Export conversations to Markdown format
- 🎯 Precise XPath-based content extraction
- 🔄 Cross-browser compatibility
- ⚡ Lightweight and fast
- 💪 Full TypeScript support
- 🧪 Comprehensive test coverage
- 🎨 Customizable settings

## Installation

### Development Version
1. Clone this repository
   ```bash
   git clone https://github.com/aliemrevezir/prompt2docs.git
   ```
2. Install dependencies
   ```bash
   cd prompt2docs/v1.0.2-typescript
   npm install
   ```
3. Build the extension
   ```bash
   npm run build
   ```
4. Load in Firefox:
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `dist` directory

### Production Version
*(Coming soon to Firefox Add-ons)*

## Development

### Available Scripts

- `npm run build` - Build the extension
- `npm run watch` - Watch for changes and rebuild
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
prompt2docs/
├── src/
│   ├── types/           # TypeScript interfaces and types
│   ├── utils/           # Utility functions
│   ├── background.ts    # Background script
│   ├── content.ts       # Content script
│   └── popup/          # Extension popup
│       ├── popup.html
│       ├── popup.css
│       └── popup.ts
├── assets/             # Icons and images
├── dist/              # Compiled output
├── tests/             # Test files
├── webpack.config.js  # Webpack configuration
├── tsconfig.json     # TypeScript configuration
├── .eslintrc.json   # ESLint configuration
└── package.json
```

## Technical Details

- **Version**: 1.0.2
- **Language**: TypeScript
- **Browser Support**: Firefox
- **Build Tools**: 
  - Webpack
  - TypeScript
  - ESLint
  - Jest
- **Manifest Version**: 2

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

## Development Guidelines

### TypeScript Conventions
- Use strict type checking
- Avoid `any` types when possible
- Document complex types and interfaces
- Use modern ES6+ features
- Follow ESLint configuration

### Code Style
- Use meaningful variable and function names
- Document complex functions with JSDoc comments
- Keep functions small and focused
- Use async/await for asynchronous operations
- Follow the Single Responsibility Principle

### Testing
- Write unit tests for all new features
- Maintain high test coverage
- Test edge cases and error conditions
- Use Jest for testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Firefox WebExtensions API
- Powered by TypeScript
- Inspired by the need for better chat data portability 