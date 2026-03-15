  // File: services/mailgunService.js

  const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

  const sendEmailNotification = (to, subject, text, html) => {
    return mg.messages.create('your-mailgun-domain', {
      from: "Pasive Notifications <mailgun@hello.pasive.co>",
      to: [to],
      subject: subject,
      text: text,
      html: html
    })
    .then(msg => console.log(msg))
    .catch(err => console.log(err));
  };

  module.exports = { sendEmailNotification };