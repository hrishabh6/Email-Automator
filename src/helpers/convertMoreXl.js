import XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to check if a value is empty
const isEmpty = (value) => {
    return value === undefined || value === null || value === '';
};

// Function to convert Excel to JSON
function convertExcelToJson(inputFile) {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(inputFile);
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // Transform data to ensure consistent property names and handle empty fields
        const transformedData = jsonData.map(row => ({
            email: isEmpty(row.Email || row.email) ? null : (row.Email || row.email),
            name: isEmpty(row.Name || row.name) ? null : (row.Name || row.name),
            lastName: isEmpty(row['Last Name'] || row.lastName) ? null : (row['Last Name'] || row.lastName),
            firstName: isEmpty(row['First Name'] || row.firstName) ? null : (row['First Name'] || row.firstName),
            company: isEmpty(row.Company || row.company) ? null : (row.Company || row.company),
            title: isEmpty(row.Title || row.title) ? null : (row.Title || row.title)
        }));
        
        // Create assets directory if it doesn't exist
        const assetsDir = join(process.cwd(), 'assets');
        if (!existsSync(assetsDir)) {
            mkdirSync(assetsDir);
        }
        
        // Write to JSON file
        const outputPath = join(assetsDir, 'moreHrContacts.json');
        writeFileSync(
            outputPath,
            JSON.stringify(transformedData, null, 2),
            'utf8'
        );
        
        console.log(`Successfully converted Excel to JSON. File saved at: ${outputPath}`);
        console.log(`Total records processed: ${transformedData.length}`);
        
        return transformedData;
        
    } catch (error) {
        console.error('Error processing Excel file:', error.message);
        throw error;
    }
}

// Usage example
const excelFile = './moreHRDatabase.xls'; // Replace with your Excel file path
convertExcelToJson(excelFile);