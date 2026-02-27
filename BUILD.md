# Build Scripts for Different Platforms

## Automatic Build with GitHub Actions (Recommended)

This is the easiest way to build for all platforms:

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add build workflow"
git push
```

### Step 2: Create a tag to trigger build
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 3: Download executables from GitHub Releases
Go to: `https://github.com/YOUR_USERNAME/xmlToExcel/releases`

The GitHub Actions will automatically build:
- `xml-to-excel-macos` (macOS)
- `xml-to-excel.exe` (Windows)
- `xml-to-excel-linux` (Linux)

## Manual Build on Each Platform

If you prefer to build manually, you need to run these commands on each platform:

### Windows
```powershell
# Install Bun (one-time)
powershell -c "irm bun.sh/install.ps1|iex"

# Clone repo
git clone YOUR_REPO_URL
cd xmlToExcel

# Install and build
bun install
bun run compile:win

# Binary created at: dist/xml-to-excel.exe
```

### macOS
```bash
# Install Bun (one-time)
curl -fsSL https://bun.sh/install | bash

# Clone repo
git clone YOUR_REPO_URL
cd xmlToExcel

# Install and build
bun install
bun run compile:mac

# Binary created at: dist/xml-to-excel
```

### Linux
```bash
# Install Bun (one-time)
curl -fsSL https://bun.sh/install | bash

# Clone repo
git clone YOUR_REPO_URL
cd xmlToExcel

# Install and build
bun install
bun run compile:linux

# Binary created at: dist/xml-to-excel
```

## Docker Build (Alternative)

If you have Docker, you can build for Windows/Linux from macOS:

```bash
# Build for Linux
docker run --rm -v "$PWD:/app" -w /app oven/bun sh -c "bun install && bun run compile:linux"

# For Windows, you need a Windows Docker image
docker run --rm -v "$PWD:/app" -w /app mcr.microsoft.com/windows/servercore:ltsc2022 powershell -Command "bun install && bun run compile:win"
```

## Quick Test of GitHub Actions

To test the workflow without creating a release:

1. Push to GitHub
2. Go to `Actions` tab
3. Select "Build Executables" workflow
4. Click "Run workflow" button
5. Download artifacts from the completed run

## Release Workflow

1. Make changes and commit
2. Create a tag: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. Wait for GitHub Actions to complete (~5-10 minutes)
5. Download executables from Releases page

## Notes

- **Cross-compilation**: Bun doesn't support true cross-compilation between OSes
- **Size**: All binaries are ~60MB (includes Bun runtime)
- **Dependencies**: Binaries are self-contained, no installation needed on target machine
- **Permissions**: Linux/macOS binaries may need `chmod +x` after download
