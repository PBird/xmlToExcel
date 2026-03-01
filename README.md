# XML to Wolvox Excel Converter

Converts UBL e-Fatura XML files to Wolvox 26 Stock Entry Excel format.

**Features:**
- ✅ **Wolvox 26 Stock Entry parser** for Turkish warehouse management
- ✅ Automatic Turkish character normalization (İ→I, Ş→S, Ç→C, Ö→O, Ü→U, Ğ→G)
- ✅ Uppercase product names
- ✅ Fixed A-T column layout (Wolvox standard)
- ✅ Unit code conversion (NIU/C62/C262→ADET, BX/PA→KUTU)
- ✅ Compatible with Microsoft Excel, LibreOffice, Google Sheets
- ✅ Auto-fit column widths with minimum width (8 chars) for Excel compatibility
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

# 2. Put UBL e-Fatura XML files in xmlDosyaları folder
# (folder is auto-created if it doesn't exist)

# 3. Run the executable
./xml-to-excel

# 4. Wolvox-compatible Excel files appear in excelDosyaları folder
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

### Wolvox 26 Stock Entry Parser

Specialized parser for Wolvox 26 warehouse management system. Converts UBL e-invoices to Wolvox-compatible Stock Entry format:

**Features:**
- ✅ Turkish character normalization (İ→I, Ş→S, Ç→C, Ö→O, Ü→U, Ğ→G)
- ✅ Product names converted to UPPERCASE
- ✅ Fixed A-T column layout (Wolvox standard)
- ✅ Automatic KDV rate extraction
- ✅ Barcode extraction from AdditionalItemIdentification

**Usage:**
```bash
# Run the application
./xml-to-excel

# Or for development
bun run dev
```

**Column Mapping (A-T):**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sıra | Fatura no | Tarih | Ürün Barkodu | Stok Adı | Stok Kodu | Ürün Miktarı | Ürün Birimi | Birim Fiyatı | Mal Hizmet Tutarı | | Marka | Ürün Durumu | KDV Oranı | | İZLEME TİPİ | | | | Varsayılan Depo |

**Header Section:**
- FATURA NO: [FATURA NO]
- TARİH: [TARİH] | SAAT: [SAAT]
- ÜNVAN: [FİRMA ADI]
- VKN/TCKN: [VKN/TCKN]
- GENEL TOPLAM: [GENEL TOPLAM] [DÖVİZ]

**Products Table (Key Fields):**
| Sıra | Fatura no | Tarih | Ürün Barkodu | Stok Adı | Stok Kodu | Ürün Miktarı | Ürün Birimi | Birim Fiyatı | Mal Hizmet Tutarı | Marka | Ürün Durumu | KDV Oranı | Varsayılan Depo |
|------|-----------|-------|--------------|----------|-----------|--------------|--------------|--------------|-------------------|-------|-------------|-----------|----------------|
| [1, 2, 3...] | [FATURA NO] | [TARİH] | [BARKOD] | [ÜRÜN ADI*] | [ÜRÜN KODU] | [MİKTAR] | [BİRİM] | [BİRİM FİYATI] | [MAL HİZMET TUTARI] | | 1 | [KDV %] | MDEPO |

*Product names are automatically converted to UPPERCASE with Turkish character normalization

**Turkish Character Conversion:**
- İ → I
- Ş → S
- Ç → C
- Ö → O
- Ü → U
- Ğ → G

**Unit Code Conversion (H Sütunu):**
| XML UnitCode | Excel Birim |
|--------------|-------------|
| NIU | ADET |
| C62 | ADET |
| C262 | ADET |
| BX | KUTU |
| PA | KUTU |

## Parser Module

**File:**
- `src/parsers/wolvox-parser.ts` - Wolvox 26 Stock Entry parser

**Exported Functions:**
- `parseWolvoxXml(xmlContent: string): WolvoxParseResult` - Parse UBL XML for Wolvox
- `wolvoxProductToExcelRow(product: WolvoxProduct): any[]` - Convert product to Wolvox Excel row
- `getWolvoxExcelHeaders(): string[]` - Get Wolvox Excel headers (A-T columns)
- `normalizeTurkishChars(text: string): string` - Turkish character normalization
- `toUpperAndNormalize(text: string): string` - Convert to uppercase and normalize
- `unitCodeToTurkish(unitCode: string): string` - Convert XML UnitCode to Turkish unit

**TypeScript Interfaces:**
```typescript
interface WolvoxProduct {
  sira: number;
  faturaNo: string;
  tarih: string;
  urunBarkodu: string;
  stokAdi: string;
  stokKodu: string;
  urunMiktari: number;
  urunBirimi: string;
  birimFiyat: number;
  malHizmetTutari: number;
  kdvOrani: number;
}

interface WolvoxHeader {
  faturaNo: string;
  tarih: string;
  saat: string;
  unvan: string;
  vknTckn: string;
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
A: Only UBL e-Fatura XML files (`.xml` extension) are processed automatically.

**Q: Can I customize input/output directories?**
A: Currently, app uses `xmlDosyaları` for input and `excelDosyaları` for output. These folders are auto-created.

**Q: What happens if there are no XML files?**
A: The app displays "No XML files found" and exits gracefully.

**Q: Can I process multiple XML files at once?**
A: Yes! All `.xml` files in `xmlDosyaları` folder are processed in a single run.

**Q: What Excel format is generated?**
A: Wolvox 26 Stock Entry format with A-T column layout, optimized for Turkish warehouse management.

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

- **v2.0.1** - Added Ürün Miktarı column (G)
- **v2.0.0** - Wolvox-only format (removed Fatura format, always produces Wolvox-compatible Excel)
- **v1.1.4** - Fixed column width issue in Microsoft Excel (minimum width: 8 chars)
- **v1.1.3** - Added Birim Fiyatı and Mal Hizmet Tutarı columns (I, J)
- **v1.1.2** - Fixed Stok Kodu to use SellersItemIdentification
- **v1.1.1** - Added Sıra, Fatura no, Tarih columns (A, B, C)
- **v1.1.0** - Wolvox 26 Stock Entry parser support
- **v1.0.0** - Initial release with Fatura parser support
