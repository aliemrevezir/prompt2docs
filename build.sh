#!/bin/bash

# Create build directory
mkdir -p build

# Remove old build if exists
rm -f build/prompt2docs.zip

# Copy necessary files
cp -r \
    manifest.json \
    background.js \
    content.js \
    LICENSE \
    popup \
    assets \
    build/

# Remove any development or temporary files
cd build
find . -name "*.DS_Store" -type f -delete
find . -name "*.log" -type f -delete

# Create ZIP file
zip -r prompt2docs.zip \
    manifest.json \
    background.js \
    content.js \
    LICENSE \
    popup/ \
    assets/

echo "Build complete! The extension package is in build/prompt2docs.zip" 