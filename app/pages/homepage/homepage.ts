import {Page, NavController, IonicApp} from 'ionic-angular';
import {Consts} from '../../helpers/consts';
import {Widget} from '../../widgets/widget';
import {CloudFunctions} from '../../helpers/cloudfunctions';

@Page({
  templateUrl: 'build/pages/homepage/homepage.html',
  directives: [Widget]
})
export class HomePage {

  nav:any; app:any; chatMessages:any[]; replyOptions:any[];
  typing:boolean; TYPING_DELAY:number; THINKING_DELAY:number; SCROLL_DELAY:number;
  dev:boolean = true;

	constructor(ionicApp: IonicApp, nav: NavController) {
    Parse.initialize(Consts.PARSE_APPLICATION_ID, Consts.PARSE_JS_KEY);
    this.nav = nav;
    this.app = ionicApp;
    this.initialize();
    this.THINKING_DELAY = (this.dev) ? 0 : 1000;
    this.TYPING_DELAY = (this.dev) ? 0 : 1500;
    this.SCROLL_DELAY = (this.dev) ? 0 : 3000;
  }

  initialize() {
    this.typing = true;
    this.chatMessages = [];
    CloudFunctions.initConversation((data, error?) => {
      if (!error) {
        this.processReceivedTreeObject(data.treeObject);
      } else {
        console.log('Error', error.message);
      }
    });
  }

  //Set state of typing, controls display of typing indicator
  setTyping(typing:boolean) {
    this.typing = typing;
    this.scrollToBottom();
  }

  //Called when a treeObject is received
  processReceivedTreeObject(treeObject) {
    //console.log('processReceivedTreeObject', treeObject);
    this.setTyping(false);

    let treeObjectMessages = treeObject.get(Consts.TREEOBJECTS_MESSAGES);
    let randIndex:number = 0;
    let messageObject:any = {
      usersMessage: false
    }
    if (treeObjectMessages.length == 1 && treeObjectMessages[0].widgetName) {
      messageObject.isWidget = true;
      messageObject.widget = treeObjectMessages[0];
    } else {
      messageObject.isWidget = false;
      messageObject.message = this.processMessage(treeObjectMessages[randIndex]);
    }
    this.chatMessages.push(messageObject);
    this.scrollToBottom();
    if (!messageObject.isWidget) {
      if (treeObject.get(Consts.TREEOBJECTS_CHILDRENCONNECTORS)[0].length > 0) {
        this.replyOptions = [];
        for (let i = 0; i < treeObject.get(Consts.TREEOBJECTS_CHILDRENCONNECTORS)[0].length;
           i++) {
          let replyOption:any = {
            message: treeObject.get(Consts.TREEOBJECTS_CHILDRENCONNECTORS)[0][i],
            pointer: treeObject.get(Consts.TREEOBJECTS_CHILDREN)[i]
          }
          //console.log('Reply Option', treeObject, replyOption);
          this.replyOptions.push(replyOption);
        }
      } else {
        this.setTyping(true);
        setTimeout(() => {
          this.fetchAndProcessPointer(treeObject.get(Consts.TREEOBJECTS_CHILDREN)[0]);
        }, this.TYPING_DELAY);
      }
    }
  }

  cool() {
    console.log('cool')
  }

  //Replaces hot keywords with dynamic data
  processMessage(message:string) {
    let editedString:string = message.replace("#~user_firstname~#", 
      (Parse.User.current()) ? Parse.User.current().get(Consts.USER_FIRSTNAME) : "Stranger");
    return editedString;
  }

  //Fetches a parse object from server when given one, and calls processReceivedTreeObject
  fetchAndProcessPointer(pointer:any) {
    //console.log('Going to fetch:', pointer);
    pointer.fetch({
      success: (parseObject) => {
        this.processReceivedTreeObject(parseObject);
      },
      error: (parseObject, error) => {
        alert('There was a network error, please try again later.');
      }
    });
  }

  //Adds user choice to conversation and calls to fetch next treeObject
  replyWithMessage(message:any) {
    //console.log('replyWithMessage', message);
    let messageObject:any = {
      message: message.message,
      usersMessage: true
    }
    this.chatMessages.push(messageObject);
    this.scrollToBottom();
    this.replyOptions = [];
    setTimeout(() => {
      this.setTyping(true);
      setTimeout(() => {
        this.fetchAndProcessPointer(message.pointer);
      }, this.TYPING_DELAY);
    }, this.THINKING_DELAY);
  }

  //Scroll to bottom of ion-content with defined scroll time animation
  scrollToBottom() {
    let contentHandle:any = this.app.getComponent('homepage-content');
    if (contentHandle && contentHandle.scrollElement) {
      contentHandle.scrollTo(0, contentHandle.scrollElement.scrollHeight, this.SCROLL_DELAY);
    } else {
      console.log('Today elememt not found');
    }
  }
}
