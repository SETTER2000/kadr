/**
 * MailController
 *
 * @description :: Server-side logic for managing mails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
const nodemailer = require('nodemailer');

module.exports = {
    send: function (req, res) {
// create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'mail.ru',
            auth: {
                user: 'ins09@mail.ru',
                pass: 'AdminMudak-123'
            }
        });

// setup email data with unicode symbols
        let mailOptions = {
            from: '"Fred Foo 👻" <SETTER2000@yandex.ru>', // sender address
            to: 'SETTER2008@yandex.ru, lphp@mail.ru', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world ?', // plain text body
            html: '<b>Hello world ?</b>' // html body
        };

// send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
    });
    }
};

