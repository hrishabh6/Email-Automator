import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function parseExcel(filePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Initialize an array to store all sheet data
    const allData = [];

    // Iterate over each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      allData.push(...sheetData); // Append sheet data to array
    }

    // Define the output file path
    const outputFilePath = path.join(__dirname, 'allHrContacts.json');

    // Write the JSON data to a file
    await fs.promises.writeFile(outputFilePath, JSON.stringify(allData, null, 2));

    console.log(`✅ Data successfully written to ${outputFilePath}`);
  } catch (error) {
    console.error('❌ Error processing Excel file:', error);
  }
}

// Example usage:
const excelFilePath = path.join(__dirname, '/assets/CompanyWise HR contact .xlsx'); // Replace with actual file path
parseExcel(excelFilePath);
