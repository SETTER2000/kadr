/**
 * Created by apetrov on 25.10.2017.
 */

'use strict';
const nodemailer = require('nodemailer');
module.exports = {
    sender: function (options, done) {

        /**
         * done - http://sailsjs.com/documentation/concepts/services/creating-a-service
         */


        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(sails.config.email);


        // Проверка подключения
        transporter.verify(function (error, success) {
            if (error) {
                sails.log('Ошибка! Не могу подключиться к почтовому серверу.', error);
                return false;
            } else {
                console.log('Подключение к почтовому серверу: Ok!');
            }
        });

        /**
         * Пример объекта options
         options = {
                from: '"Служба сообщений системы KADR" <kadr@mail.ru>', // sender address
                to: 'user@mail.ru, user2@mail.ru', // list of receivers
                subject: 'Hello ✔', // Subject line
                text: 'Hello world?', // plain text body
                html: '<b>Hello world?</b>' // html body
            };
         */
        options.from = sails.config.email.from;
        options.to = (sails.config.email.development) ? sails.config.admin.email : options.to;
        //options.bcc = sails.config.email.bcc; // скрытую копию сообщения куда отправлять


        //// send mail with defined transport object
        transporter.sendMail(options, (error, info) => {
            if (error) {
                console.log('ERR EMAIL SERVICE', error);
                return false;
            }

            //console.log('Message sent: %s', info.messageId);

            return done();

            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });

        //function myFunc(arg) {
        //    console.log(`arg was => ${arg}`);
        //    // send mail with defined transport object
        //    transporter.sendMail(options, (error, info) => {
        //        if (error) {
        //            console.log('ERR EMAIL SERVICE', error);
        //            return done(error);
        //        }
        //
        //        console.log('Message sent: %s', info.messageId);
        //
        //        return done();
        //
        //        // Preview only available when sending through an Ethereal account
        //        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        //
        //        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        //        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        //    });
        //}
        //
        //setTimeout(myFunc, 100000, 'funky');
    }
};