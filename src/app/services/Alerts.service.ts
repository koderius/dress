import {Injectable} from '@angular/core';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  private loader;
  private dismissNextLoader : boolean;

  constructor(
    public alertCtrl : AlertController,
    private loaderCtrl : LoadingController,
    private toastCtrl : ToastController,
  ) {

    // Override the default alert method
    window.alert = (message)=>{this.notice(message)};

  }


  async notice(msg : string, title? : string, text?: string) : Promise<void> {

    const a = await this.alertCtrl.create({
      header : title,
      subHeader : msg,
      message: text,
      buttons : ['Dismiss'],
    });
    await a.present();
    await a.onDidDismiss();

  }


  async areYouSure(question : string, msg? : string, yesText?: string, noText?: string) : Promise<boolean> {

    const a = await this.alertCtrl.create({
      subHeader : question,
      message : msg,
      buttons : [
        {
          text : noText || 'No',
        },
        {
          text : yesText || 'Yes',
          role : 'yes',
        }
      ],
    });
    a.present();
    const res = await a.onDidDismiss();
    return res.role == 'yes'

  }


  async showLoader(msg? : string) {

    this.loader = await this.loaderCtrl.create({
      message : msg || ''
    });
    this.loader.present();
    if(this.dismissNextLoader) {
      await this.dismissLoader();
      this.dismissNextLoader = false;
    }

  }

  async dismissLoader() : Promise<void> {
    if(this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
    else
      this.dismissNextLoader = true;
  }

}
