import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {FeedBack} from '../../src/app/models/Feedback';
import {RankCalc} from '../../src/app/Utils/RankCalc';
import {IClientAuthorizeCallbackData} from 'ngx-paypal';
import {RentDoc} from '../../src/app/models/Rent';
import {HttpsError} from 'firebase-functions/lib/providers/https';
import {payDepositBack, payForRent} from './paymentFunctions';
import {sendEmailToSupport} from './EmailFunctions';


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


/**
 * A function being auto called by the PayPal account, when a payment to the business account is being authorized.
 * The function creates a new rent document, set the dress into "rented" and pays the dress owner his part.
 */
export const paypalWebhook = functions.https.onRequest((req, resp) => {

  // TODO: Separate capturing and authorizing: Check the payment details on capture, and then authorize it.

  if (req.body.event_type == 'CHECKOUT.ORDER.APPROVED') {

    // Get the purchase data out of the web hook resource
    try {
      const resource: IClientAuthorizeCallbackData = req.body.resource;
      if(resource && resource.purchase_units) {
        const purchase = resource.purchase_units[0];
        if(purchase) {
          admin.firestore().collection('payments').doc(purchase.custom_id).set(resource);
          const refIds = (purchase.reference_id || '').split('_');
          const dressId = refIds[0];
          const renterId = refIds[1];
          const items = purchase.items;
          if(items) {
            const price = items.find((item) => item.category == 'PHYSICAL_GOODS').unit_amount;
            const deposit = items.find((item) => item.category == 'DIGITAL_GOODS').unit_amount;
            // Create a rent document, and set the dress stats to rented
            const timestamp = admin.firestore.Timestamp.now().toMillis();
            admin.firestore().runTransaction(async transaction => {
              const dressRef = admin.firestore().collection('dresses').doc(dressId);
              const ownerId = (await transaction.get(dressRef)).get('owner');
              await transaction.update(dressRef, 'status', 2);
              const rent: RentDoc = {
                id: purchase.custom_id,
                status: 1,
                dressId,
                ownerId,
                renterId,
                deposit,
                price,
                timestamp,
              };
              await transaction.set(admin.firestore().collection('rents').doc(purchase.custom_id), rent);
              // Pay the renter his part
              await payForRent(rent, price, purchase.shipping);
            });
          }
        }
      }
    }
    catch (e) {
      // For any error in the process TODO: Report support
      console.error(e);
      throw new HttpsError('unimplemented', 'The dress owner might not received his payment', e);
    }
    resp.send('Payment received');
  }
  else
    throw new HttpsError('unknown', 'Unknown payment event');
});


/**
 * Called by the dress owner after he received his dress back.
 * Pays the deposit back to the renter and closes the rent document.
 */
export const approveDressBack = functions.https.onCall(async (rentId: string, context) => {

  // Get the rent document
  const rentRef = admin.firestore().collection('rents').doc(rentId);
  const rent = (await rentRef.get()).data() as RentDoc;
  if(!rent)
    throw new HttpsError('not-found', 'Rent document was not found');

  // Check the caller is the dress owner
  if(rent.ownerId == context.auth.uid) {
    // Close the rent document and set the dress status back to public
    await admin.firestore().runTransaction(async transaction => {
      transaction.update(admin.firestore().collection('dresses').doc(rent.dressId), 'status', 1);
      transaction.update(rentRef, 'status', 0);
    });
    // Pay the deposit
    await payDepositBack(rent);
  }
  else
    throw new HttpsError('permission-denied', 'Caller is not the dress owner');

});

/**
 * Send custom email to the support team
 */
export const reportToSupport = functions.https.onCall(async (data: {subject: string, text: string}, context) => {
  await sendEmailToSupport(
    data.subject + ' (Sent from app)',
    `${data.text}<br><br>Sent by user ID: ${context.auth.uid}`
  );
});
