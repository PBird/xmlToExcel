# XML to Excel Converter

Converts XML files from `xmlDosyaları` directory to Excel files in `excelDosyaları` directory.

**Features:**
- ✅ Generic XML to Excel conversion
- ✅ **Specialized Fatura (E-Invoice) parser** with product list extraction
- ✅ Modular and maintainable code structure
- ✅ TypeScript support with full type safety
- ✅ Built with Bun.js for optimal performance

## Installation

### For Development
```bash
bun install
```

### For End Users (No Installation Required!)

**Option 1: Use Pre-Compiled Binary**
1. Download the executable for your platform
2. Place it anywhere on your computer
3. Run it - no installation needed!

**Option 2: Compile From Source**
```bash
# Install Bun (one-time setup)
curl -fsSL https://bun.sh/install | bash

# Clone and compile
bun install
bun run compile  # Compiles for current platform
```

## Quick Start

### For End Users (Binary)

```bash
# 1. Download or copy the executable
./xml-to-excel  # or xml-to-excel.exe on Windows

# 2. Put XML files in xmlDosyaları folder
# (folder is auto-created if it doesn't exist)

# 3. Run the executable again
./xml-to-excel

# 4. Excel files appear in excelDosyaları folder
```

### For Developers

```bash
# Install dependencies
bun install

# Run in development
bun run dev

# Build for deployment
bun run build

# Create standalone executable
bun run compile
```

### Development Mode
```bash
bun run dev
```

### Build
```bash
bun run build
```

### Run Built Version
```bash
node dist/index.js
```

## 🚀 Standalone Executables

### ⭐ Automatic Build (Recommended - GitHub Actions)

The easiest way to get executables for all platforms:

1. **Push to GitHub** (if not already)
2. **Create a release tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **Wait 5-10 minutes** - GitHub Actions automatically builds all platforms
4. **Download from Releases:**
   - `https://github.com/YOUR_USERNAME/xmlToExcel/releases`
   - Download: `xml-to-excel-macos`, `xml-to-excel.exe`, or `xml-to-excel-linux`

This creates executables for **all platforms automatically** - no need for Windows/Linux machines!

### Manual Build on Current Platform

Create a single executable file for your current operating system:

```bash
bun run compile
```

Binary created at: `dist/xml-to-excel` (or `xml-to-excel.exe` on Windows)

**After compilation, run directly without any dependencies:**

```bash
# macOS/Linux
./dist/xml-to-excel

# Windows
.\dist\xml-to-excel.exe
```

### Manual Build on Specific Platform (Requires That OS)

To build for a different platform, you need to build on that OS:

**On Windows:**
```powershell
bun install
bun run compile:win
```

**On macOS:**
```bash
bun install
bun run compile:mac
```

**On Linux:**
```bash
bun install
bun run compile:linux
```

**Note:** Binary sizes are approximately 60MB (includes Bun runtime and all dependencies).

### 📖 Detailed Build Instructions

See [BUILD.md](BUILD.md) for:
- GitHub Actions setup guide
- Manual build on each platform
- Docker build alternatives
- Troubleshooting

### Using the Executable

1. Put XML files in `xmlDosyaları` folder
2. Run the executable (no installation needed!)
3. Find Excel files in `excelDosyaları` folder

**Example:**
```bash
# Create folders
mkdir xmlDosyaları

# Copy your XML files to xmlDosyaları/

# Run the executable
./xml-to-excel  # or xml-to-excel.exe on Windows

# Excel files are now in excelDosyaları/
```

### Executable Distribution

The executable is self-contained and can be distributed:
- **No installation required** on target machine
- **No Node.js or Bun needed**
- **No dependencies to install**
- Just copy the binary and run it!

**File sizes:**
- macOS: ~60 MB
- Windows: ~60 MB
- Linux: ~60 MB

## Directory Structure

```
xmlToExcel/
├── src/
│   ├── index.ts                 # Main application
│   └── parsers/
│       └── fatura-parser.ts     # Fatura parser module
├── xmlDosyaları/                # Input XML files (create this directory)
├── excelDosyaları/              # Output Excel files (auto-created)
└── dist/                        # Build output (auto-created)
```

## Features

### 1. Generic XML Conversion

Automatically converts any XML file to Excel format:

Given an XML file `xmlDosyaları/data.xml`:
```xml
<root>
  <item>
    <name>Item 1</name>
    <value>100</value>
  </item>
  <item>
    <name>Item 2</name>
    <value>200</value>
  </item>
</root>
```

This will create `excelDosyaları/data.xlsx` with the following structure:

| name | value |
|------|-------|
| Item 1 | 100 |
| Item 2 | 200 |

### 2. Fatura (E-Invoice) Parser

Specialized parser for Turkish e-invoice format. Automatically detects and parses:

**Extracted Information:**
- Fatura başlık bilgileri (Fatura No, Tarih, VKN/TCKN, Ünvan, Adres)
- Tüm ürün satırları (Ürün adı, kodları, miktar, fiyatlar)
- KDV bilgileri (oranlar, tutarlar)
- Toplam tutarlar

**Excel Output Structure:**

⚠️ **Not:** Aşağıdaki tüm veriler örnek/kurgusal verilerdir, gerçek bilgiler değildir.
⚠️ **Note:** All data below is example/fictional data, not real information.

**Header Section:**
- Fatura No: [FATURA NO]
- Tarih: [TARİH SAAT]
- VKN/TCKN: [VKN/TCKN]
- Ünvan: [FİRMA ADI]
- Adres: [ADRES]
- Matrah: [MATRAH] TRY
- KDV: [KDV TUTARI] TRY
- GENEL TOPLAM: [GENEL TOPLAM] TRY

**Products Table:**
| Fatura No | Tarih | Satır No | Ürün Adı | Ürün Kodu | Satıcı Ürün Kodu | Alıcı Ürün Kodu | Miktar | Birim | Birim Fiyat | Kalem Tutarı | KDV % | KDV Tutarı |
|-----------|-------|----------|-----------|-----------|-----------------|----------------|--------|-------|-------------|--------------|-------|------------|
| [FATURA NO] | [TARİH] | [SATIR NO] | [ÜRÜN ADI] | [ÜRÜN KODU] | [SATICI ÜRÜN KODU] | [ALICI ÜRÜN KODU] | [MİKTAR] | [BİRİM] | [BİRİM FİYAT] | [KALEM TUTARI] | [KDV %] | [KDV TUTARI] |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

## Parser Module

**File:** `src/parsers/fatura-parser.ts`

**Exported Functions:**
- `parseFaturaXml(xmlContent: string): FaturaParseResult` - Parse fatura XML
- `faturaProductToExcelRow(product: FaturaProduct): any[]` - Convert product to Excel row
- `getExcelHeaders(): string[]` - Get Excel headers
- `faturaHeaderDetailsToExcelRows(header: FaturaHeader): any[][]` - Convert header to Excel rows

**TypeScript Interfaces:**
```typescript
interface FaturaProduct {
  faturaNo: string;
  faturaTarih: string;
  satirNo: number;
  urunAdi: string;
  urunKodu: string;
  saticiUrunKodu: string;
  aliciUrunKodu: string;
  miktar: number;
  birim: string;
  birimFiyat: number;
  kalemTutari: number;
  kdvOran: number;
  kdvTutari: number;
  toplamTutar: number;
}

interface FaturaHeader {
  faturaNo: string;
  tarih: string;
  saat: string;
  vknTckn: string;
  unvan: string;
  adres: string;
  toplamMatrah: number;
  toplamKdv: number;
  genelToplam: number;
  doviz: string;
}
```

## Dependencies

- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - XML parsing
- [exceljs](https://github.com/exceljs/exceljs) - Excel file creation
- [bun](https://bun.sh/) - JavaScript runtime and bundler
- [typescript](https://www.typescriptlang.org/) - Type safety

## Development

**TypeScript check:**
```bash
bunx tsc --noEmit
```

**Build:**
```bash
bun run build
```

## Code Standards

This project follows:
- Modular, functional architecture
- Pure functions (no side effects)
- TypeScript with strict mode
- Comprehensive type definitions
- Separation of concerns (parser logic in separate module)

## License

MIT

## FAQ

**Q: Do I need to install Node.js or Bun to use compiled binary?**
A: No! The compiled binary is self-contained and includes everything it needs.

**Q: Can I run this on a computer without internet?**
A: Yes! Once you have the executable, no internet connection is required.

**Q: What file formats are supported?**
A: Only XML files (`.xml` extension) are processed automatically.

**Q: Can I customize input/output directories?**
A: Currently, app uses `xmlDosyaları` for input and `excelDosyaları` for output. These folders are auto-created.

**Q: What happens if there are no XML files?**
A: The app displays "No XML files found" and exits gracefully.

**Q: Can I process multiple XML files at once?**
A: Yes! All `.xml` files in `xmlDosyaları` folder are processed in a single run.

**Q: What's the difference between `bun run build` and `bun run compile`?**
A:
- `build`: Creates a JavaScript bundle that requires Bun or Node.js to run
- `compile`: Creates a standalone executable that runs on its own

**Q: Can I build Windows executable from macOS (or vice versa)?**
A: **No, not directly.** Bun doesn't support true cross-compilation between different operating systems. You have two options:
   1. **Use GitHub Actions** (Recommended) - Push to GitHub, create a tag, and it automatically builds for ALL platforms
   2. **Build on target platform** - Run the build commands on a Windows machine to get a Windows executable

**Q: How do I get executables for all platforms without having those machines?**
A: Use the GitHub Actions workflow included in this project:
   1. Push to GitHub
   2. Create a tag: `git tag v1.0.0 && git push origin v1.0.0`
   3. Wait 5-10 minutes
   4. Download from GitHub Releases (all 3 platforms included)

## Platform Support

✅ **macOS** (Intel & Apple Silicon)
✅ **Windows** (x64)
✅ **Linux** (x64, ARM64)

**Tested on:**
- macOS 14+ (ARM64 & Intel)
- Windows 10/11
- Ubuntu 20.04+
- Debian 11+

## Troubleshooting

**Binary won't run on Windows:**
- Right-click → Properties → Unblock
- Or run: `Unblock-File .\xml-to-excel.exe`

**Permission denied on Linux/macOS:**
```bash
chmod +x xml-to-excel
```

**"File too large" error:**
- Binary is ~60MB (includes Bun runtime)
- This is normal and expected

## Version History

- **v1.0.0** - Initial release with Fatura parser support
