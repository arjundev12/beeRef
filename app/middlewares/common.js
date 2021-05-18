

const utilities = require('util');
const config = require('../../config/config')
const walletModel = require('../models/wallet')
const sgMail = require('@sendgrid/mail')
const constant = require('../utilities/constants')
console.log("api key1111", process.env.SENDGRID_API_KEY1, constant.SENDGRID_API_KEY1)
sgMail.setApiKey(constant.SENDGRID_API_KEY1)

var jwt = require('jsonwebtoken');
var verifyOptions = {
    issuer: config.i,
    subject: config.s,
    audience: config.BASE_URL,
    expiresIn: config.tempTokenExpiresTime,
    algorithm: config.algorithm
};
const nodemailer = require('nodemailer');

class Common {
    constructor() {
        return {
            jwtDecode: this.jwtDecode.bind(this),
            emailsenderdyanmic: this.emailsenderdyanmic.bind(this),
            _createWallet: this._createWallet.bind(this),
            _sendMail : this._sendMail.bind(this)
        }
    }
    async _sendMail(toMail, text = constant.defaultMsg, subject = constant.defaultSub) {
        try {
            const msg = {
                to: toMail, // Change to your recipient
                from: constant.fromMail, // Change to your verified sender
                subject: subject,
                // text: text,
                html: `<strong>${text}</strong>`,
            }

            let sendMail = await sgMail.send(msg)
            console.log("sendMail", sendMail)
        } catch (error) {
            console.error("error in _sendMail", error)
        }
        return true
    }
    async jwtDecode(token) {
        try {
            let tokeData = await jwt.verify(token, config.superSecret)
            if (tokeData) {
                return tokeData
            }
        } catch (error) {
            console.log("failed authentication in jwt decode")
        }

    }
   

    async emailsenderdyanmic(data) {
      if (data.from && Array.isArray(data.to) && data.password && data.subject && data.text) {
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: data.from,
                  pass: data.password
              },
              port: 587,
              host: 'smtp.gmail.com',
              // tls: {
              //   rejectUnauthorized: false
              // }
          });
         
          try{
            var info = await transporter.sendMail({
              from: data.from,
              to: data.to,
              subject: data.subject,
              text: data.text
            });
            console.log('Data email', info);
            return "Mail send";
          }catch(err){
            console.log('Error while sending mail', err);
            return "please check email or password or please turn on less secure app access";
          }
      }
      else {
          return "please send proper parameter to the function";
      }
    }
    async _createWallet(id , type) {
        try {
            let saveData1 = {}
             saveData1.wallet_type = type;
             saveData1.user_id= id
             saveData1.status = 'active'

            let saveData = new walletModel(saveData1)
            await saveData.save();
            console.log("wallet create successfully")
        } catch (error) {
            console.error("error in _createWallet", error)
        }
        return true

    }
  
}

module.exports = new Common();
