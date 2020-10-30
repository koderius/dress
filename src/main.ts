import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {firebaseConfig} from './app/FirebaseConfig';
import * as firebase from 'firebase/app';
import 'firebase/analytics';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

firebase.initializeApp(firebaseConfig);
firebase.analytics();
