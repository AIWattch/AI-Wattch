#!/bin/bash

# AI Wattch Extension Build Script
echo "🚀 Building AI Wattch Extension..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf build
rm -rf build-chrome
rm -rf build-firefox

# Install dependencies
echo "📦 Installing dependencies..."
npm install


# Build for Firefox
echo "🔨 Building extension for firefox..."
rm -rf dist

cp manifest-firefox.json manifest.json
sleep 1
export TARGET_BROWSER="firefox"
npm run build


# Create build directory for Firefox
echo "📁 Creating firefox build directory..."
mkdir -p build-firefox

# Copy built files to build directory
echo "📋 Copying built files for firefox..."
cp -r dist/* build-firefox/

# Create zip file for distribution
echo "📦 Creating distribution package for chrome..."

cd build-firefox
zip -r ai-wattch-firefox-extension_$(date +%Y-%m-%d_%H%M).zip . -x "*.txt"

cd ..



# Build the extension
echo "🔨 Building extension for chrome..."

cp manifest-chrome.json manifest.json
sleep 1
export TARGET_BROWSER="chrome"
npm run build

# Create build directory
echo "📁 Creating chrome build directory..."
mkdir -p build-chrome

# Copy built files to build directory
echo "📋 Copying built files for chrome..."
cp -r dist/* build-chrome/


# Create zip file for distribution
echo "📦 Creating distribution package for chrome..."

cd build-chrome
zip -r ai-wattch-chrome-extension_$(date +%Y-%m-%d_%H%M).zip . -x "*.txt"
cd ..


echo "✅ Build complete!"
echo "📁 Extension files are in: ./build/"
echo "📦 Distribution package: ./ai-wattch-extension.zip"
echo ""
echo "To install the extension:"
echo "1. Open Chrome/Edge and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the './build' folder"
echo ""
echo "For Firefox:"
echo "1. Go to about:debugging"
echo "2. Click 'This Firefox'"
echo "3. Click 'Load Temporary Add-on' and select the manifest.json from './build'"
