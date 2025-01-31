import { SMTPClient } from 'emailjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SMTP client
const client = new SMTPClient({
    user: 'hrishabhjoshi123@gmail.com',
    password: process.env.EMAIL_PASSWORD,
    host: 'smtp.gmail.com',
    ssl: true,
});

// File paths
const jsonFilePath = path.join(__dirname, 'allHrContacts2.json');
const countFilePath = path.join(__dirname, '/assets/sentEmailCount.txt');

// Constants
const MAX_EMAILS = 390; // Limit total emails sent
const BATCH_SIZE = 10; // Number of emails sent per batch

// Function to read the last sent email count
function getSentEmailCount() {
    try {
        if (fs.existsSync(countFilePath)) {
            return parseInt(fs.readFileSync(countFilePath, 'utf8'), 10) || 0;
        }
    } catch (error) {
        console.error('⚠️ Error reading sent email count:', error);
    }
    return 0;
}

// Function to update the sent email count
function updateSentEmailCount(count) {
    try {
        fs.writeFileSync(countFilePath, count.toString(), 'utf8');
    } catch (error) {
        console.error('⚠️ Error writing sent email count:', error);
    }
}

// Load sent email count from file
let sentEmailCount = getSentEmailCount();

// Function to send job applications
async function sendJobApplications() {
    try {
        if (sentEmailCount >= MAX_EMAILS) {
            console.log('✅ All emails have been sent. Stopping the script.');
            process.exit(0);
        }

        // Read JSON data
        const rawData = fs.readFileSync(jsonFilePath);
        const recipients = JSON.parse(rawData);

        // Read resume file
        const resumePath = path.join(__dirname, 'assets', 'resume.pdf');
        const resumeData = fs.readFileSync(resumePath);

        // Get recipients for this batch
        const batchRecipients = recipients.slice(sentEmailCount, sentEmailCount + BATCH_SIZE);

        if (batchRecipients.length === 0) {
            console.log('✅ No more recipients left. Stopping script.');
            process.exit(0);
        }

        // Process each recipient
        const emailPromises = batchRecipients.map(async (recipient) => {
            const { Name, Email, Company } = recipient;
            const JobRole = 'Web Developer Intern';

            const message = {
                text: `Dear ${Name},\n\nI hope this email finds you well. I am writing to express my interest in the ${JobRole} position at ${Company}. I have attached my resume for your review.\n\nBest regards,\nHrishabh Joshi`,
                from: 'Hrishabh Joshi <hrishabhjoshi123@gmail.com>',
                to: `${Name} <${Email}>`,
                subject: `Application for ${JobRole} Role at ${Company}`,
                attachment: [
                    {
                        data: `<html>
                            <body>
                                <p>Dear ${Name},</p>
                                <p>I hope this email finds you well. I am writing to express my interest in the <strong>${JobRole}</strong> position at <strong>${Company}</strong>. I have attached my resume for your review.</p>
                                <p>Best regards,<br>Hrishabh Joshi</p>
                                <p>Connect with me on:</p>
                                <ul>
                                    <li><a href="https://www.hrishabhjoshi.xyz" target="_blank">Portfolio</a></li>
                                    <li><a href="http://www.linkedin.com/in/hrishabh-joshi-61399a298" target="_blank">LinkedIn</a></li>
                                    <li><a href="https://github.com/hrishabh6" target="_blank">GitHub</a></li>
                                </ul>
                            </body>
                        </html>`,
                        alternative: true,
                    },
                    {
                        data: resumeData,
                        type: 'application/pdf',
                        name: 'Hrishabh_Joshi_Resume.pdf',
                    },
                ],
            };

            try {
                await client.sendAsync(message);
                sentEmailCount++;
                updateSentEmailCount(sentEmailCount);
                console.log(`✅ [${sentEmailCount}] Email sent to ${Email}`);
            } catch (err) {
                console.error(`❌ Failed to send email to ${Email}:`, err);
            }
        });

        // Wait for all emails to be sent
        await Promise.all(emailPromises);

        // Stop execution after sending all required emails
        if (sentEmailCount >= MAX_EMAILS) {
            console.log('✅ Maximum emails sent. Stopping the script.');
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error processing emails:', error);
    }
}

// Run every 5 seconds
const interval = setInterval(() => {
    console.log('🚀 Running email batch...');
    sendJobApplications();
}, 5000);
