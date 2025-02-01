import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(__dirname, 'allHrContacts.json');

const testRun = async () => {
    const rawData = fs.readFileSync(jsonFilePath);
    const recipients = JSON.parse(rawData);
    
    console.log(`Number of HR contacts: ${recipients.length}`);
}

testRun();
  