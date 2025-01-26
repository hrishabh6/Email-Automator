# Email Automator

**Motto**: "Automate professional email communication, one click at a time."

## Overview
Email Automator is a tool designed to simplify and streamline the process of sending bulk emails with personalized content. Whether you're applying for jobs, reaching out to clients, or managing professional communication, Email Automator helps you save time and maintain consistency while ensuring each email is tailored to its recipient.

## Features
- **Bulk Emailing**: Send personalized emails to multiple recipients.
- **HTML Email Support**: Compose beautifully formatted emails using HTML.
- **Attachment Handling**: Attach files like resumes or portfolios to your emails.
- **Personalization**: Customize each email with recipient-specific details (e.g., name, company name).
- **Secure SMTP Configuration**: Leverages SMTP for secure and reliable email delivery.

## Technologies Used
- **Node.js**: Backend runtime environment.
- **emailjs**: SMTP client for sending emails.
- **JavaScript (ES6)**: Programming language for logic implementation.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hrishabh6/Email-Automator.git
   cd Email-Automator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `constants.js` file with recipient data:
   ```javascript
   export const recipients = [
       {
           receiverEmail: 'example1@example.com',
           receiverName: 'John Doe',
           companyName: 'TechCorp'
       },
       // Add more recipients as needed
   ];
   ```

## Usage
1. Configure your SMTP client:
   - Replace placeholders in the following configuration with your email credentials (preferably use an app password):
     ```javascript
     const client = new SMTPClient({
         user: 'your_email@gmail.com',
         password: 'your_app_password',
         host: 'smtp.gmail.com',
         ssl: true,
     });
     ```
2. Prepare your resume or attachment:
   - Place your attachment in the `assets` folder (e.g., `assets/resume.pdf`).

3. Run the application:
   ```bash
   node index.js
   ```
   Emails will be sent to all recipients specified in `constants.js`.

## Example Email Template
The email body includes dynamic placeholders for recipient names and company details:
```html
<html>
  <body>
    <p>Dear [Recipient Name],</p>
    <p>I am excited to apply for the <strong>Full Stack Web Developer</strong> role at <strong>[Company Name]</strong>. Attached is my resume for your review.</p>
    <p>Thank you for your time and consideration. I look forward to the opportunity to contribute to your team.</p>
    <p>Best regards,</p>
    <p>[Your Name]</p>
    <p>
      <a href="http://www.linkedin.com/in/hrishabh-joshi-61399a298">LinkedIn</a> |
      <a href="https://github.com/hrishabh6">GitHub</a> |
      <a href="https://www.hrishabhjoshi.xyz">Portfolio</a>
    </p>
  </body>
</html>
```

## Note
- Make sure to enable "Less Secure Apps" or use an app-specific password if using Gmail.
- Test emails before bulk sending to ensure proper formatting and delivery.

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.

---

Happy Automating!

