import { SMTPClient } from 'emailjs';
import fs from 'fs';
import path from 'path';
import { recipients } from './constants.js';
import { fileURLToPath } from 'url';

// Configure your SMTP client
const client = new SMTPClient({
    user: 'hrishabhjoshi123@gmail.com',
    password: process.env.EMAIL_PASSWORD,
    host: 'smtp.gmail.com',
    ssl: true,
});

// Function to send emails with resume attachment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendJobApplications(recipients) {
    // Read your resume file
    const resumePath = path.join(__dirname, 'assets', 'resume.pdf');
    const resumeData = fs.readFileSync(resumePath);

    // Using map to process each recipient asynchronously
    const emailPromises = recipients.map(async (recipient) => {
        const { receiverEmail, receiverName, companyName } = recipient;

        // Create the email message
        const message = {
            text: `Dear ${receiverName},\n\n` +
                `I hope this message finds you well. I am reaching out to express my sincere interest in the ${companyName}'s exciting Full Stack Web Developer position. As a passionate and driven developer, I have been following your company's growth and innovative projects closely, and I believe my technical expertise and enthusiasm align perfectly with the role.\n\n` +
                `Attached is my resume, which highlights my experience in web development and my ability to build scalable, user-centric solutions. I am confident that my skills in frontend and backend development would make me a valuable addition to your talented team.\n\n` +
                `I would love the opportunity to further discuss how I can contribute to ${companyName}'s continued success. Please feel free to reach out if you'd like to schedule a time to chat.\n\n` +
                `Thank you for considering my application. I look forward to the possibility of working with you and contributing to the incredible work ${companyName} is doing.\n\n` +
                `Best regards,\n` +
                `[Your Name]`,
            from: 'Your Name <hrishabhjoshi123@gmail.com>',
            to: `${receiverName} <${receiverEmail}>`,
            subject: `Application for Full Stack Web Developer Role at ${companyName}`,
            attachment: [
                {
                    data: `<html>
  <body>
    <p>Dear ${receiverName},</p>

    <p>I hope this message finds you well. I am reaching out to express my sincere interest in the <strong>${companyName}'s</strong> exciting Full Stack Web Developer position. As a passionate and driven developer, I have been following your company's growth and innovative projects closely, and I believe my technical expertise and enthusiasm align perfectly with the role.</p>

    <p>Attached is my resume, which highlights my experience in web development and my ability to build scalable, user-centric solutions. I am confident that my skills in frontend and backend development would make me a valuable addition to your talented team.</p>

    <p>I would love the opportunity to further discuss how I can contribute to <strong>${companyName}'s</strong> continued success. Please feel free to reach out if you'd like to schedule a time to chat.</p>

    <p>Thank you for considering my application. I look forward to the possibility of working with you and contributing to the incredible work <strong>${companyName}</strong> is doing.</p>

    <p>Best regards,<br>
    [Your Name]</p>

    <p>Connect with me on:</p>
    <ul>
      <li><a href="http://www.linkedin.com/in/hrishabh-joshi-61399a298" target="_blank">LinkedIn</a></li>
      <li><a href="https://github.com/hrishabh6" target="_blank">GitHub</a></li>
      <li><a href="https://www.hrishabhjoshi.xyz" target="_blank">Portfolio</a></li>
    </ul>
  </body>
</html>
`
                    ,
                    alternative: true,
                },
                {
                    data: resumeData,
                    type: 'application/pdf',
                    name: 'Your_Name_Resume.pdf',
                },
            ],
        };


        try {
            // Send the email
            const response = await client.sendAsync(message);
            console.log(`Email sent to ${receiverEmail}:`, response);
        } catch (err) {
            console.error(`Failed to send email to ${receiverEmail}:`, err);
        }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
}

// Run the function every 3 seconds
setInterval(() => {
    console.log('Running action...');
    sendJobApplications(recipients);
}, 3000);
