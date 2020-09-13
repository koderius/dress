import * as firebase from 'firebase/app';
import 'firebase/functions';

export class CloudFunctions {

  private static GetCloudFunction<T = void, R = void>(cloudFnName: string) : T extends void ? () => Promise<R> : (data: T) => Promise<R> {
    const callable = firebase.functions().httpsCallable(cloudFnName);
    return (async (data?: T) => (await callable(data)).data as R) as (T extends void ? () => Promise<R> : (data: T) => Promise<R>);
  }

  static get tryVerifyUserEmail() {
    return CloudFunctions.GetCloudFunction<void, boolean>('tryVerifyUserEmail');
  }
  static get approveDressBack() {
    return CloudFunctions.GetCloudFunction<string>('approveDressBack');
  }
  static get reportToSupport(){
    return CloudFunctions.GetCloudFunction<{subject: string, text: string}, any>('reportToSupport');
  }

}
