import {IShipping, IUnitAmount} from 'ngx-paypal';
import * as axios from 'axios';
import {PaypalClient, PaypalSecret} from './keys';
import * as admin from 'firebase-admin';
import {HttpsError} from 'firebase-functions/lib/providers/https';
import {RentDoc} from '../../src/app/models/Rent';
import {UserDoc} from '../../src/app/models/User';
import {sendEmailToSupport} from './EmailFunctions';

/** Base PayPal API address **/
export const paypalAPI = 'https://api.sandbox.paypal.com/v1';

/**
 * Get paypal temporary bearer token for making API calls
 */
export const getPayPalToken: ()=>Promise<string> = async () => {
  const resp = await axios.default.post(
    paypalAPI + '/oauth2/token',
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
  return resp.data['access_token'] as string;
};


/**
 * Pay money from the business account to some user for rent
 * @param rent - The rent document that was created after the payment has been authorized
 * @param amount - The net amount to pay to the dress owner
 * @param shipping - The shipping address according to the payment data
 */
export const payForRent = async (rent: RentDoc, amount: IUnitAmount, shipping: IShipping) => {

  // Get the dress owner
  const uid = rent.ownerId;
  const user: UserDoc = (await admin.firestore().collection('users').doc(uid).get()).data();
  if(!user || !user.paypalEmail) {
    // TODO: Report support
    throw new HttpsError('not-found', `The user: ${uid} was not found, or has no registered paypal account`);
  }

  // Get the dress name
  const dressName: string = (await admin.firestore().collection('dresses').doc(rent.dressId).get()).get('name');

  // Pay to the dress owner
  const token = await getPayPalToken();
  await axios.default.post(
    paypalAPI + '/payments/payouts',
    {
      "sender_batch_header": {
        "sender_batch_id": "Rent_" + rent.id,
        "email_subject": "Payment for dress received",
        "email_message": `You have received a payout for renting your dress: ${dressName}.
        \n Make sure you send your dress to ${shipping.name.full_name} address:\n
        ${[shipping.address.address_line_1, shipping.address.address_line_2, shipping.address.address_line_2, shipping.address.admin_area_1, shipping.address.country_code, shipping.address.postal_code].filter((v)=>v).join(', ')}`
      },
      "items": [
        {
          "recipient_type": "EMAIL",
          "amount": {
            "value": amount.value,
            "currency": amount.currency_code
          },
          "sender_item_id": rent.dressId,
          "receiver": user.paypalEmail
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }
  ).catch(()=>{
    sendEmailToSupport('Payment error (auto email)',
      `The customer ${user.fullName} (ID: ${user.uid}; email: ${user.email}) did not get his payment for renting a dress.
       Rent document ID: ${rent.id}. The amount should be payed: ${amount.currency_code + amount.value}
       He might not have a PayPal account, or entered wrong payment data.
       Please contact him/her for fixing the issue and commit the payment.
     `);
  });
};

/**
 * Pay the deposit from the business account back to the renter.
 * @param rent - the rent document, which contains the renter UID and the deposit details.
 */
export const payDepositBack = async (rent: RentDoc) => {

  const user = (await admin.firestore().collection('users').doc(rent.renterId).get()).data() as UserDoc;
  if(!user || !user.paypalEmail) {
    // TODO: Report support
    throw new HttpsError('not-found', `The user: ${user.uid} was not found, or has no registered paypal account`);
  }

  // Get the dress name
  const dressName: string = (await admin.firestore().collection('dresses').doc(rent.dressId).get()).get('name');

  const token = await getPayPalToken();
  await axios.default.post(
    paypalAPI + '/payments/payouts',
    {
      "sender_batch_header": {
        "sender_batch_id": "Deposit_Return_" + rent.id,
        "email_subject": "Rent deposit returned",
        "email_message": `You have received your deposit back for renting the dress: ${dressName}.`
      },
      "items": [
        {
          "recipient_type": "EMAIL",
          "amount": {
            "value": rent.deposit.value,
            "currency": rent.deposit.currency_code
          },
          "sender_item_id": rent.dressId + '_Deposit_Return',
          "receiver": user.paypalEmail
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }
  ).catch(()=>{
    sendEmailToSupport('Payment error (auto email)',
      `The customer ${user.fullName} (ID: ${user.uid}; email: ${user.email}) did not get his deposit back after the rent was ended.
       He might not have a PayPal account, or entered wrong payment data.
       Please contact him/her for fixing the issue and commit the payment.
    `);
  });

};
