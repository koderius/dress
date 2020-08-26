import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as axios from 'axios';
import {PaypalClient, PaypalSecret} from './keys';
import {FeedBack} from '../../src/app/models/Feedback';
import {RankCalc} from '../../src/app/Utils/RankCalc';


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

/**
 * A function for "manually" set user's email as verified.
 * Works only if the user has some provider which is not 'password' (then the email should be verified by verification email).
 * The reason for this function is that facebook (and maybe some other providers) are not considered as email verifiers.
 */
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


/** *
 * When dress is being deleted:
 * - Delete all its images from storage
 */
// export const onDressDelete = functions.firestore.document('dresses/{dressId}').onWrite((change, context) => {
//
//   // *Not for new dresses
//   if(change && change.before) {
//     const oldDress = change.before.data();
//     // If the dress was deleted, delete all its images
//     if(!change.after)
//       admin.storage().bucket().deleteFiles({directory: `dressImages/${oldDress.id}`});
//     // If it was changes
//     else {
//       const newDress = change.after.data();
//       const oldPhotos = oldDress.photos || [];
//       const newPhotos = newDress ? newDress.photos || [] : [];
//       // Get all the photos that are not in the new dress
//       const photosToDelete = oldPhotos.filter((p)=>!newPhotos.includes(p));
//     }
//
//   }
//
// });


export const onFeedBack = functions.firestore.document('{collection}/{docId}/feedbacks/{writerId}').onWrite((change) => {

  // Get the current feedback and the old feedback
  const feedback: FeedBack = change.after.data() || null;
  const oldFeedback: FeedBack = change.before.data() || null;

  // Get the reference of the feedback's object (user/dress)
  const doc = change.after.ref.parent.parent;

  // Read the ranks, add the new rank and remove the old rank, calc the new average, and set them in the document
  admin.firestore().runTransaction(async transaction => {
    const ranks: number[] = (await transaction.get(doc)).get('ranks') || [0,0,0,0,0];
    if(!feedback || !oldFeedback || feedback.rank != oldFeedback.rank) {
      if(feedback)
        ranks[feedback.rank - 1]++;
      if(oldFeedback)
        ranks[oldFeedback.rank - 1]--;
      transaction.set(doc, {
        ranks: ranks,
        rank: RankCalc.AverageRank(ranks),
      }, {merge: true});
    }
  });

});


export const getPaypalToken = functions.https.onCall(async (data, context) => {

  const resp = await axios.default.post(
    'https://api.sandbox.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: PaypalClient,
        password: PaypalSecret,
      },
    }
  );

  return resp.data['access_token'];

});
