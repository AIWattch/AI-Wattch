# AI Wattch Extension Build Script

Write-Host "🚀 Building AI Wattch Extension..."

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..."

Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build-chrome -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build-firefox -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "📦 Installing dependencies..."
npm install

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"

# ========================================
# FIREFOX BUILD
# ========================================

Write-Host "🔨 Building extension for Firefox..."

Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Copy-Item manifest-firefox.json manifest.json -Force

Start-Sleep -Seconds 1

$env:TARGET_BROWSER = "firefox"

npm run build

Write-Host "📁 Creating Firefox build directory..."

New-Item -ItemType Directory -Force -Path build-firefox | Out-Null

Write-Host "📋 Copying built files for Firefox..."

robocopy dist build-firefox /E | Out-Null

Write-Host "📦 Creating Firefox distribution package..."

Compress-Archive `
    -Path "build-firefox\*" `
    -DestinationPath "ai-wattch-firefox-extension_$timestamp.zip" `
    -Force

# ========================================
# CHROME BUILD
# ========================================

Write-Host "🔨 Building extension for Chrome..."

Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Copy-Item manifest-chrome.json manifest.json -Force

Start-Sleep -Seconds 1

$env:TARGET_BROWSER = "chrome"

npm run build

Write-Host "📁 Creating Chrome build directory..."

New-Item -ItemType Directory -Force -Path build-chrome | Out-Null

Write-Host "📋 Copying built files for Chrome..."

robocopy dist build-chrome /E | Out-Null

Write-Host "📦 Creating Chrome distribution package..."

Compress-Archive `
    -Path "build-chrome\*" `
    -DestinationPath "ai-wattch-chrome-extension_$timestamp.zip" `
    -Force

# ========================================
# DONE
# ========================================

Write-Host ""
Write-Host "✅ Build complete!"
# Write-Host ""
# Write-Host "📁 Firefox build folder: build-firefox"
# Write-Host "📁 Chrome build folder: build-chrome"
# Write-Host ""
# Write-Host "📦 Firefox ZIP: ai-wattch-firefox-extension_$timestamp.zip"
# Write-Host "📦 Chrome ZIP: ai-wattch-chrome-extension_$timestamp.zip"
# Write-Host ""
# Write-Host "To install in Chrome:"
# Write-Host "1. Open chrome://extensions/"
# Write-Host "2. Enable Developer Mode"
# Write-Host "3. Click Load Unpacked"
# Write-Host "4. Select build-chrome"
# Write-Host ""
# Write-Host "To install in Firefox:"
# Write-Host "1. Open about:debugging"
# Write-Host "2. Click This Firefox"
# Write-Host "3. Click Load Temporary Add-on"
# Write-Host "4. Select build-firefox/manifest.json"