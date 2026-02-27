# Changelog

## [1.0.2] - 2026-02-27

### Changed
- Fixed path resolution for XML and Excel directories
- Cleaned up unused imports

### CI/CD
- Added required permissions for GitHub releases
- Added main branch push to workflow triggers
- Fixed YAML syntax errors in workflow

### Fixed
- Use current working directory for folders (xmlDosyaları, excelDosyaları)

## [1.0.0] - 2025-12-10

### Added
- Initial XML to Excel converter implementation
- Fatura parser for invoice XML files
- Support for fast-xml-parser and exceljs
- Multi-platform compilation (Windows, Linux, macOS)
- GitHub Actions CI/CD workflow
