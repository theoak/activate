/// <reference path="../typings/parse/parse.d.ts" />
/// <reference path="../typings/custom_activate/custom_activate.d.ts" />
/// <reference path="../typings/chart/chart.d.ts" />
/// <reference path="../typings/cordova/plugins/Camera.d.ts" />
import {ionicBootstrap, App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {Component} from '@angular/core';
import {HomePage} from './pages/homepage/homepage';
import {SettingsPage} from './pages/settingspage/settingspage';

@Component({
  templateUrl: 'build/app.html',
})
class MyApp {
  rootPage: any = HomePage;
  pages: Array<{title: string, component: any}>

  constructor(private app: App, private platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'HopePage', component: HomePage },
      { title: 'Settings', component: SettingsPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component);
  }
}
ionicBootstrap(MyApp, [], {});
