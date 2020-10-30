import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import {NoReplyEmailPassword} from './keys';

// export const sendEmailToSupport = async (subject: string, text: string = '', html: string = '') => {
//   const snapshot = await admin.firestore().collection('app').doc('support').get();
//   const email = snapshot.get('email');
//   admin.firestore().collection('mails').add({
//     to: email,
//     message: {
//       subject,
//       text,
//       html,
//     }
//   });
// };

const noreplyEmail = 'dressesapp.noreply@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: noreplyEmail,
    pass: NoReplyEmailPassword,
  }
});


export const sendEmailToSupport = async (subject: string, text: string = '', html: string = '') : Promise<any> | never => {

  // Get the support address
  const snapshot = await admin.firestore().collection('app').doc('support').get();
  const email = snapshot.get('email');

  // Set options
  const mailOptions = {
    from: `Do not reply <${noreplyEmail}>`,
    to: email,
    subject,
    text,
    html
  };

  // Send the email
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if(error)
        reject(error);
      else
        resolve(info);
    });
  });

};
