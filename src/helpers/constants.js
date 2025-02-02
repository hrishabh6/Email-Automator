import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SMTPClient } from 'emailjs';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const rawData = fs.readFileSync(jsonFilePath);
// const recipients = JSON.parse(rawData);



const testRun = async () => {
    
    console.log(`Number of HR contacts: ${recipients.length}`);
}


// Configure SMTP client
const client = new SMTPClient({
    user: 'hrishabh.joshi.dev@gmail.com',
    password: 'tcsr gupi csya musk', // Use your Gmail App Password
    host: 'smtp.gmail.com',
    ssl: true,
});

// File paths
const resumePath = path.join(__dirname, '../../assets/resume.pdf');
const jsonFilePath = path.join(__dirname, '../../assets/dummy.json');

// Function to read recipients from JSON file
function getRecipients() {
    try {
        const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
        const recipients = JSON.parse(rawData);
        if (!Array.isArray(recipients) || recipients.length === 0) {
            console.error('❌ Error: No recipients found in dummy.json');
            return [];
        }
        return recipients;
    } catch (error) {
        console.error('❌ Error reading dummy.json:', error);
        return [];
    }
}

// Read resume data
let resumeData;
try {
    resumeData = fs.readFileSync(resumePath);
} catch (error) {
    console.error('❌ Error reading resume file:', error);
}

// Function to send job applications
async function sendJobApplications() {
    const recipients = getRecipients();
    if (recipients.length === 0) {
        console.log('⚠️ No recipients to send emails.');
        return;
    }

    try {
        const emailPromises = recipients.map(async (recipient) => {
            const { Name, Email } = recipient;
            if (!Name || !Email) {
                console.warn(`⚠️ Skipping recipient with missing details:`, recipient);
                return;
            }

            const Company = 'ABC Corp.';
            const JobRole = 'Web Developer Intern';

            const message = {
                text: `Dear ${Name},\n\nI am excited to apply for the ${JobRole} position at ${Company}. Please find my resume attached.\n\nBest regards,\nHrishabh Joshi`,
                from: 'Hrishabh Joshi <hrishabh.joshi.dev@gmail.com>',
                to: `${Name} <${Email}>`,
                subject: `Application for ${JobRole} at ${Company}`,
                attachment: [
                    {
                        data: `<html>
                            <body>
                                <p>Dear ${Name},</p>
                                <p>I am excited to apply for the ${JobRole} position at ${Company}. My skills in Web Development align well with your team.</p>
                                <p>Please find my resume attached for review.</p>
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
                await new Promise((resolve, reject) => {
                    client.send(message, (err, message) => {
                        if (err) reject(err);
                        else resolve(message);
                    });
                });
                console.log(`✅ Email sent to ${Email}`);
            } catch (err) {
                console.error(`❌ Failed to send email to ${Email}:`, err);
            }
        });

        await Promise.all(emailPromises);
    } catch (error) {
        console.error('❌ Error processing emails:', error);
    }
}

// Run once every 5 minutes (to prevent spam issues)
setInterval(() => {
    console.log('🚀 Running email batch...');
    sendJobApplications();
},  3000); // 5 minutes