import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// export const onUserCreated = functions.auth.user().onCreate((user, context) => {
//
//   // Create user document
//   admin.firestore().collection('users').doc(user.uid).set({
//     uid: user.uid,
//     email: user.email,
//     displayName: user.displayName,
//     photoURL: user.photoURL,
//     phoneNumber: user.phoneNumber,
//   });
//
//   // Get the user provider (only one when created)
//   const provider = user.providerData[0].providerId;
//
//   // If the user was created by provider
//   if(provider != 'password')
//     admin.auth().updateUser(user.uid, {emailVerified: true});
//
// });

admin.initializeApp();

export const tryVerifyUserEmail = functions.https.onCall(async (data, context) => {

  if(context.auth) {

    // Get user's data
    const uid = context.auth.uid;
    const user = await admin.auth().getUser(uid);

    // Check user providers
    const providers = user.providerData;

    // If the only provider is email + password, email will not be verified by this function
    if(providers.length == 1 && providers[0].providerId == 'password')
      return false;

    // For all other providers, consider email as verified
    else {
      await admin.auth().updateUser(user.uid, {emailVerified: true});
      return true;
    }

  }

  else
    return false;

});
