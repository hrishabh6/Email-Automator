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
const jsonFilePath = path.join(__dirname, '../assets/allHrContacts2.json');
const countFilePath = path.join(__dirname, '../assets/sentEmailCount.txt');
const sentEmailsLogPath = path.join(__dirname, '../assets/sentEmailsLog.json');

// Constants
const MAX_EMAILS = 690;
const BATCH_SIZE = 10;

// Function to load sent emails log
function loadSentEmailsLog() {
    try {
        if (fs.existsSync(sentEmailsLogPath)) {
            return new Set(JSON.parse(fs.readFileSync(sentEmailsLogPath, 'utf8')));
        }
    } catch (error) {
        console.error('⚠️ Error reading sent emails log:', error);
    }
    return new Set();
}

// Function to save sent emails log
function saveSentEmailsLog(sentEmails) {
    try {
        fs.writeFileSync(sentEmailsLogPath, JSON.stringify([...sentEmails]), 'utf8');
    } catch (error) {
        console.error('⚠️ Error writing sent emails log:', error);
    }
}

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

// Load sent email count and sent emails log
let sentEmailCount = getSentEmailCount();
let sentEmails = loadSentEmailsLog();

// Function to send job applications
async function sendJobApplications() {
    try {
        if (sentEmailCount >= MAX_EMAILS) {
            console.log('✅ All emails have been sent. Stopping the script.');
            process.exit(0);
        }

        // Read JSON data
        const rawData = fs.readFileSync(jsonFilePath);
        const allRecipients = JSON.parse(rawData);

        // Filter out recipients whose emails have already been sent
        const recipients = allRecipients.filter(recipient => !sentEmails.has(recipient.Email));

        // Read resume file
        const resumePath = path.join(__dirname, '../assets', 'resume.pdf');
        const resumeData = fs.readFileSync(resumePath);

        // Get recipients for this batch
        const batchRecipients = recipients.slice(0, BATCH_SIZE);

        if (batchRecipients.length === 0) {
            console.log('✅ No more recipients left. Stopping script.');
            process.exit(0);
        }

        // Process each recipient
        const emailPromises = batchRecipients.map(async (recipient) => {
            const { Name, Email, Company } = recipient;
            
            // Skip if email has already been sent
            if (sentEmails.has(Email)) {
                return;
            }

            const JobRole = 'Web Developer Intern';

            const message = {
                text: `Dear ${Name},\n\nI hope this message finds you well. I am writing to express my interest in the ${JobRole} internship opportunity at ${Company}. I believe my skills and passion for the Computer Science make me a strong candidate for this position. Attached is my resume for your review.\n\nI would greatly appreciate the opportunity to contribute to your team and gain valuable experience. I look forward to the possibility of discussing how I can contribute to the success of your company.\n\nThank you for considering my application.\n\nBest regards,\nHrishabh Joshi`,
                from: 'Hrishabh Joshi <hrishabhjoshi123@gmail.com>',
                to: `${Name} <${Email}>`,
                subject: `Application for ${JobRole} Internship at ${Company}`,
                attachment: [
                    {
                        data: `<html>
                            <body>
                                <p>Dear ${Name},</p>
                                <p>I hope this message finds you well. I am excited to apply for the ${JobRole} internship position at ${Company}. I believe that my background in Computer Science and my passion for Web Developement align well with the goals of your team.</p>
                                <p>Please find my resume attached for your review. I would love the opportunity to further discuss how my skills can contribute to the continued success of your company.</p>
                                <p>Thank you for your time and consideration. I look forward to hearing from you soon.</p>
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
                sentEmails.add(Email);
                updateSentEmailCount(sentEmailCount);
                saveSentEmailsLog(sentEmails);
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
