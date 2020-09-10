import * as admin from 'firebase-admin';

export const sendEmailToSupport = async (subject: string, text: string = '', html: string = '') => {
  const snapshot = await admin.firestore().collection('app').doc('support').get();
  const email = snapshot.get('email');
  admin.firestore().collection('mails').add({
    to: email,
    message: {
      subject,
      text,
      html,
    }
  });
};
