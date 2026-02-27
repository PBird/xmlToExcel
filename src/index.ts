import { readFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, basename, extname, dirname } from "path";
import { XMLParser } from "fast-xml-parser";
import ExcelJS from "exceljs";
import {
  parseFaturaXml,
  faturaProductToExcelRow,
  getExcelHeaders,
  faturaHeaderDetailsToExcelRows,
  FaturaParseResult,
} from "./parsers/fatura-parser.js";

/**
 * Reads all XML files from a directory
 * @param directory - Directory path to read XML files from
 * @returns Array of file paths
 */
function readXmlFiles(directory: string): string[] {
  const files = readdirSync(directory);
  return files.filter((file) => extname(file).toLowerCase() === ".xml");
}

/**
 * Parses an XML file and returns the data
 * @param filePath - Path to the XML file
 * @returns Parsed data object
 */
function parseXmlFile(filePath: string): any {
  const xmlContent = readFileSync(filePath, "utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    ignoreDeclaration: true,
    ignorePiTags: true,
    allowBooleanAttributes: true,
  });

  return parser.parse(xmlContent);
}

/**
 * Converts parsed generic XML data to a 2D array for Excel
 * @param data - Parsed XML data
 * @returns 2D array of rows and columns
 */
function convertToExcelData(data: any): any[][] {
  if (!data || typeof data !== "object") {
    return [["No data"]];
  }

  const result: any[][] = [];
  const keys = Object.keys(data);
  const rootKey = keys[0];

  if (!rootKey) {
    return [["No data"]];
  }

  const rootData = data[rootKey];

  // Handle array of items
  if (Array.isArray(rootData)) {
    if (rootData.length === 0) {
      return [["No data"]];
    }

    // Get headers from first item
    const headers = Object.keys(rootData[0]);
    result.push(headers);

    // Add rows
    rootData.forEach((item) => {
      const row = headers.map((key) => {
        const value = item[key];
        return typeof value === "object" ? JSON.stringify(value) : value;
      });
      result.push(row);
    });
  } else if (typeof rootData === "object") {
    // Handle single object
    const headers = Object.keys(rootData);
    result.push(headers);
    const row = headers.map((key) => {
      const value = rootData[key];
      return typeof value === "object" ? JSON.stringify(value) : value;
    });
    result.push(row);
  } else {
    result.push(["Value"]);
    result.push([rootData]);
  }

  return result;
}

/**
 * Checks if the XML is a Fatura (invoice) type
 * @param xmlContent - XML content string
 * @returns True if it's a Fatura XML
 */
function isFaturaXml(xmlContent: string): boolean {
  return xmlContent.includes("<Invoices") && xmlContent.includes("<Invoice>");
}

/**
 * Creates an Excel file from Fatura data
 * @param data - FaturaParseResult object
 * @param outputPath - Path to save the Excel file
 * @param sheetName - Name of the sheet
 */
async function createFaturaExcelFile(
  data: FaturaParseResult,
  outputPath: string,
  sheetName: string = "Fatura",
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add header details
  const headerRows = faturaHeaderDetailsToExcelRows(data.header);
  headerRows.forEach((row) => worksheet.addRow(row));

  // Add empty row
  worksheet.addRow([]);

  // Add product header
  const headers = getExcelHeaders();
  const headerRow = worksheet.addRow(headers);

  // Style header row
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4472C4" },
  };

  // Add product rows
  data.products.forEach((product) => {
    const row = faturaProductToExcelRow(product);
    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    if (column.values) {
      const maxLength = Math.max(
        ...column.values.map((value: any) => String(value).length),
      );
      column.width = Math.min(maxLength + 2, 50);
    }
  });

  await workbook.xlsx.writeFile(outputPath);
}

/**
 * Creates an Excel file from generic data
 * @param data - 2D array of data
 * @param outputPath - Path to save the Excel file
 * @param sheetName - Name of the sheet
 */
async function createGenericExcelFile(
  data: any[][],
  outputPath: string,
  sheetName: string = "Sheet1",
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  await workbook.xlsx.writeFile(outputPath);
}

/**
 * Main conversion function
 * @param inputDir - Input directory containing XML files
 * @param outputDir - Output directory for Excel files
 */
async function convertXmlToExcel(
  inputDir: string,
  outputDir: string,
): Promise<void> {
  // Create input directory if it doesn't exist
  console.log("inputDir : ", inputDir);
  if (!existsSync(inputDir)) {
    console.log(`Creating input directory: ${inputDir}`);
    mkdirSync(inputDir, { recursive: true });
  }

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Read XML files
  const xmlFiles = readXmlFiles(inputDir);

  if (xmlFiles.length === 0) {
    console.log("No XML files found in", inputDir);
    return;
  }

  console.log(`Found ${xmlFiles.length} XML file(s)`);

  // Convert each XML file to Excel
  for (const xmlFile of xmlFiles) {
    try {
      const inputPath = join(inputDir, xmlFile);
      const outputFileName = basename(xmlFile, ".xml") + ".xlsx";
      const outputPath = join(outputDir, outputFileName);

      console.log(`Processing: ${xmlFile}`);

      // Read XML content
      const xmlContent = readFileSync(inputPath, "utf-8");

      // Check if it's a Fatura XML
      if (isFaturaXml(xmlContent)) {
        console.log("  → Detected as Fatura XML");
        const faturaData = parseFaturaXml(xmlContent);
        console.log(`  → Found ${faturaData.products.length} product(s)`);
        console.log(
          `  → Total: ${faturaData.header.genelToplam} ${faturaData.header.doviz}`,
        );
        await createFaturaExcelFile(
          faturaData,
          outputPath,
          basename(xmlFile, ".xml"),
        );
      } else {
        console.log("  → Processing as generic XML");
        const parsedData = parseXmlFile(inputPath);
        const excelData = convertToExcelData(parsedData);
        await createGenericExcelFile(
          excelData,
          outputPath,
          basename(xmlFile, ".xml"),
        );
      }

      console.log(`✓ Created: ${outputFileName}`);
    } catch (error) {
      console.error(
        `✗ Error processing ${xmlFile}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log("\nConversion complete!");
}

// Run the conversion
// Use current working directory (where user runs the command)
const appDir = dirname(process.execPath);
const inputDir = join(appDir, "xmlDosyaları");
const outputDir = join(appDir, "excelDosyaları");

console.log(`Current directory: ${appDir}`);
console.log(`Input directory: ${inputDir}`);
console.log(`Output directory: ${outputDir}`);

convertXmlToExcel(inputDir, outputDir)
  .catch((error) => {
    console.error('Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
