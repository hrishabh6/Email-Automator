import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract name from email
function extractNameFromEmail(email) {
    if (!email) return null;
    
    // Split email by @ and get the first part
    const namePart = email.split('@')[0];
    
    // Split by dots or underscores and capitalize each part
    const names = namePart
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    
    return names.join(' ');
}

// Function to process the text file
function processHrContacts(inputFilePath) {
    try {
        // Read the text file
        const inputText = fs.readFileSync(inputFilePath, 'utf8');
        
        // Split the text into lines and remove empty lines
        const lines = inputText
            .split('\n')
            .filter(line => line.trim() !== '')
            .slice(1); // Skip the header line
        
        // Process each line
        const contacts = lines.map(line => {
            // Split by whitespace and filter out empty strings
            const parts = line.trim().split(/\s+/).filter(Boolean);
            
            // Last part is the email
            const email = parts[parts.length - 1] || null;
            
            // Everything except the last part (email) is the company name
            const company = parts.slice(0, -1).join(' ') || null;
            
            // Extract name from email
            const name = email ? extractNameFromEmail(email) : null;
            
            return {
                name,
                email,
                company
            };
        });
        
        // Create assets directory if it doesn't exist
        const assetsDir = path.join(process.cwd(), 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir);
        }
        
        // Write to JSON file
        const outputPath = path.join(assetsDir, 'hrEmails.json');
        fs.writeFileSync(
            outputPath,
            JSON.stringify(contacts, null, 2),
            'utf8'
        );
        
        console.log(`Successfully created JSON file at: ${outputPath}`);
        console.log(`Total contacts processed: ${contacts.length}`);
        
        return contacts;
        
    } catch (error) {
        console.error('Error processing contacts:', error.message);
        throw error;
    }
}

// Get the input file path
const inputFilePath = path.join(__dirname, 'CompanyAndMails.txt');

// Process the contacts
processHrContacts(inputFilePath);