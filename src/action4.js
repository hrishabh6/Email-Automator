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

// File paths - Updated for new JSON and counter files
const jsonFilePath = path.join(__dirname, '../assets/hrEmails.json');
const countFilePath = path.join(__dirname, '../assets/bigHrEmailCounter.txt');
const sentEmailsLogPath = path.join(__dirname, '../assets/bigHrSentLog.json');

// Constants
const MAX_EMAILS = 390;
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

// Function to get and update sent email count
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

function updateSentEmailCount(count) {
    try {
        fs.writeFileSync(countFilePath, count.toString(), 'utf8');
    } catch (error) {
        console.error('⚠️ Error writing sent email count:', error);
    }
}

// Updated email message creation with company personalization
function createEmailMessage(recipient, resumeData, jobRole = 'Web Developer Intern') {
    const recipientName = recipient.name || 'HR Manager';
    const companyName = recipient.company || 'your company';

    return {
        text: `Dear ${recipientName},\n\nI hope this email finds you well...`,
        from: 'Hrishabh Joshi <hrishabhjoshi123@gmail.com>',
        to: `${recipientName} <${recipient.email}>`,
        subject: `Application for ${jobRole} Internship Position at ${companyName}`,
        attachment: [
            {
                data: `<html>
                    <body>
                        <p>Dear ${recipientName},</p>
                        <p>I hope this email finds you well. My name is Hrishabh Joshi, and I am currently a BCA student at IPU. I am reaching out to express my interest in the <strong>${jobRole}</strong> internship position at <strong>${companyName}</strong>. I have attached my resume for your review.</p>
                        <p>As an aspiring Web Developer, I have gained hands-on experience with MERN stack along with ORMs and PostgreSQL through my academic projects and coursework. I am particularly excited about the opportunity to contribute to ${companyName}'s innovative work in the industry and am confident that my technical skills and enthusiasm would make me a valuable addition to your team.</p>
                        <p>I am excited about the opportunity to contribute to the team at ${companyName} and learn from the experts in your organization.</p>
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
}

// Load sent email count and sent emails log
let sentEmailCount = getSentEmailCount();
let sentEmails = loadSentEmailsLog();

async function sendJobApplications() {
    try {
        if (sentEmailCount >= MAX_EMAILS) {
            console.log('✅ All emails have been sent. Stopping the script.');
            process.exit(0);
        }

        // Read JSON data and resume
        const recipients = JSON.parse(fs.readFileSync(jsonFilePath));
        const resumeData = fs.readFileSync(path.join(__dirname, '../assets', 'resume.pdf'));

        // Filter out recipients whose emails have already been sent or are null
        const remainingRecipients = recipients.filter(recipient => 
            recipient.email !== null && !sentEmails.has(recipient.email)
        );

        // Get recipients for this batch
        const batchRecipients = remainingRecipients.slice(0, BATCH_SIZE);

        if (batchRecipients.length === 0) {
            console.log('✅ No more recipients left. Stopping script.');
            process.exit(0);
        }

        // Process each recipient
        const emailPromises = batchRecipients.map(async (recipient) => {
            if (sentEmailCount >= MAX_EMAILS) return;

            const message = createEmailMessage(recipient, resumeData);

            try {
                await client.sendAsync(message);
                sentEmailCount++;
                sentEmails.add(recipient.email);
                updateSentEmailCount(sentEmailCount);
                saveSentEmailsLog(sentEmails);
                console.log(`✅ [${sentEmailCount}] Email sent to ${recipient.email} (${recipient.name || 'Unknown Name'}) at ${recipient.company || 'Unknown Company'}`);
            } catch (err) {
                console.error(`❌ Failed to send email to ${recipient.email}:`, err);
            }
        });

        // Wait for all emails to be sent
        await Promise.all(emailPromises);

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