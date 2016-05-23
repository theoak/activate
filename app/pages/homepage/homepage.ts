import {Page, NavController, IonicApp, Platform, Modal, ViewController} from 'ionic-angular';
import {Consts} from '../../helpers/consts';
import {Widget} from '../../widgets/widget';
import {CloudFunctions} from '../../helpers/cloudfunctions';
import {NgZone} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/Rx';
import {ProfilePage} from '../profilepage/profilepage';
import {Camera} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/homepage/homepage.html',
  directives: [Widget]
})
export class HomePage {

  nav:any; app:any; zone:any; platform:any; chatMessages:any[]; replyOptions:any[];
  typing:boolean; TYPING_DELAY:number; THINKING_DELAY:number; SCROLL_DELAY:number;
  dev:boolean = true; loadingMessages:boolean = true; recentMessagesTemp:any[];
  // recentMessagesTemp holds all the messages recently shown to user before he has replied,
  // these will only be saved once the user has made a selection. Also used to hold messages
  // before user has signed in.

  public widgetBoundCallback: Function;

	constructor(ionicApp: IonicApp, nav: NavController, zone: NgZone, platform: Platform,
   http:Http) {
    Parse.initialize(Consts.PARSE_APPLICATION_ID, Consts.PARSE_JS_KEY);
    this.nav = nav;
    this.app = ionicApp;
    this.zone = zone;
    this.platform = platform;
    this.chatMessages = [];
    this.recentMessagesTemp = [];
    this.initialize();
    this.THINKING_DELAY = (this.dev) ? 0 : 1000;
    this.TYPING_DELAY = (this.dev) ? 500 : 1500;
    this.SCROLL_DELAY = (this.dev) ? 0 : 3000;
    this.widgetBoundCallback = this.widgetCallback.bind(this);

    /*http.get('https://www.strava.com/oauth/token')
      // Call map on the response observable to get the parsed people object
      .map(res => res.json())
      // Subscribe to the observable to get the parsed people object and attach it to the
      // component
      .subscribe(people => console.log(people));*/
    /*http.post("https://www.strava.com/oauth/token", 
      "client_id=11012&client_secret=1d5dc79c5adbaaefcc6eeb2b2c9ddb584085ecfc&code=c420583602c1eb00dd60707dd48c58d46e5c8a83")
    //http.get("https://httpbin.org/ip")
      .subscribe(data => {
        alert(data);
        console.log('Returned data:', data.json());
      }, error => {
        alert('error');
        console.log('Error with ajax call:', JSON.stringify(error.json()));
    });*/
    if (this.platform.is("android") || this.platform.is("ios")) {
      var c_id = "11012";
      var c_secret = "1d5dc79c5adbaaefcc6eeb2b2c9ddb584085ecfc";
      var access_code = "c420583602c1eb00dd60707dd48c58d46e5c8a83";
      var params = "client_id=" + c_id + "&client_secret=" + c_secret + "&code=" + access_code;

      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          alert(xmlhttp.responseText);
        }
      }

      xmlhttp.open("POST", "https://www.strava.com/oauth/token", true);
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlhttp.setRequestHeader("Content-length", "3");
      xmlhttp.setRequestHeader("Connection", "close");
      xmlhttp.send(params);
    }
  }

  initialize() {
    if (Parse.User.current()) {
      this.retrieveArchieveMessages();
      //this.navigateTreeTo('start', false); //healthApi
      return;
    }
    this.typing = true;
    CloudFunctions.initConversation((data, error?) => {
      if (!error) {
        this.processReceivedTreeObject(data.treeObject);
      } else {
        console.log('Error', error.message);
        alert('There was an network error, please try again.');
      }
    });
  }

  onPageDidEnter() {
    //this.openUserProfile();
  }

  //Set state of typing, controls display of typing indicator
  setTyping(typing:boolean) {
    this.zone.run(() => {
      this.typing = typing;
    });
    this.scrollToBottom();
  }

  //Retrieve past user messages
  retrieveArchieveMessages() {
    this.loadingMessages = true;
    let Messages = Parse.Object.extend("Messages");
    let query = new Parse.Query(Messages);
    query.equalTo(Consts.MESSAGES_USER, Parse.User.current());
    query.descending("createdAt");
    query.limit(10);
    query.find({
      success: (parseObjects) => {
        for (let i = 0; i < parseObjects.length; i++) {
          let messageObject:any = {};
          if (parseObjects[i].get(Consts.MESSAGES_MESSAGE).widgetName) {
            messageObject.isWidget = true;
            messageObject.widget = parseObjects[i].get(Consts.MESSAGES_MESSAGE);
          } else {
            messageObject.isWidget = false;
            messageObject.message = parseObjects[i].get(Consts.MESSAGES_MESSAGE);
          }
          messageObject.usersMessage = parseObjects[i].get(Consts.MESSAGES_USERSMESSAGE);
          //this.chatMessages.push(messageObject);
          this.chatMessages.splice(0, 0, messageObject);
        }
        this.scrollToBottom();
        this.loadingMessages = false;
        this.navigateTreeTo('loggedIn', true);
      },
      error: (error) => {
        console.log('Error retrieving past messages:', error);
      }
    })

  }

  //Called when a treeObject is received
  processReceivedTreeObject(treeObject) {
    //console.log('processReceivedTreeObject', treeObject);
    this.setTyping(false);

    let treeObjectMessages:any[] = treeObject.get(Consts.TREEOBJECTS_MESSAGES);
    let treeObjectChildConnectors:any[]
      = treeObject.get(Consts.TREEOBJECTS_CHILDRENCONNECTORS);
    let randIndexMessages:number = Math.floor(Math.random()*treeObjectMessages.length);
    let randIndexChildren:number
      = Math.floor(Math.random()*treeObjectChildConnectors.length);
    let messageObject:any = {
      usersMessage: false
    }
    if (treeObjectMessages.length == 1 && treeObjectMessages[0].widgetName) {
      messageObject.isWidget = true;
      messageObject.widget = treeObjectMessages[0];
    } else {
      messageObject.isWidget = false;
      messageObject.message = this.processMessage(treeObjectMessages[randIndexMessages]);
    }
    this.saveMessageToParse(messageObject, treeObject, false);
    this.zone.run(() => {
      this.chatMessages.push(messageObject);
    });
    this.scrollToBottom();
    if (treeObjectChildConnectors[randIndexChildren].length > 0) {
      this.zone.run(() => {
        this.replyOptions = [];
      });
      for (let i = 0; i < treeObjectChildConnectors[0].length; i++) {
        let replyOption:any = {
          pointer: treeObject.get(Consts.TREEOBJECTS_CHILDREN)[i]
        }
        if (treeObjectChildConnectors[randIndexChildren][i].widgetName) {
          replyOption.isWidget = true;
          replyOption.widget = treeObjectChildConnectors[randIndexChildren][i];
        } else {
          replyOption.isWidget = false;
          replyOption.message = treeObjectChildConnectors[randIndexChildren][i];
        }
        //console.log('Reply Option', treeObject, replyOption);
        this.zone.run(() => {
          this.replyOptions.push(replyOption);
        });
      }
    } else {
      this.setTyping(true);
      setTimeout(() => {
        this.fetchAndProcessPointer(treeObject.get(Consts.TREEOBJECTS_CHILDREN)[0]);
      }, this.TYPING_DELAY);
    }
  }

  //Save message to parse Message class for archiving
  saveMessageToParse(messageObject:any, treeObject:any, usersMessage:boolean) {
    let Message = Parse.Object.extend(Consts.MESSAGES_CLASS);
    let message = new Message();
    message.set(Consts.MESSAGES_USERSMESSAGE, usersMessage);
    if (treeObject) {
      message.set(Consts.MESSAGES_TREEOBJECT, treeObject);
    }
    if (messageObject.message) {
      message.set(Consts.MESSAGES_MESSAGE, messageObject.message);
    } else if (messageObject.widget) {
      message.set(Consts.MESSAGES_MESSAGE, messageObject.widget);
    }
    if (Parse.User.current() == null) {
      this.recentMessagesTemp.push(message);
      return;
    }
    if (!usersMessage) {
      this.recentMessagesTemp.push(message);
    } else if (this.recentMessagesTemp.length == 0) {
      message.set(Consts.MESSAGES_USER, Parse.User.current());
      message.save();
    } else {
      this.recentMessagesTemp.push(message);
      for (let i = 0; i < this.recentMessagesTemp.length; i++) {
        this.recentMessagesTemp[i].set(Consts.MESSAGES_USER, Parse.User.current());
      }
      Parse.Object.saveAll(this.recentMessagesTemp, {
        success: (objects) => {
          this.recentMessagesTemp = [];
          message.save();
        },
        error: (error) => {
          console.log('Error saving recent messages', error.message);
          //this.recentMessagesTemp.push(message);
        }
      });
      
    }
    
  }

  //Replaces hot keywords with dynamic data
  processMessage(message:string) {
    let editedString:string = message;
    editedString = editedString.replace("#~user_firstname~#", 
      (Parse.User.current()) ? Parse.User.current().get(Consts.USER_FIRSTNAME) : "Stranger");
    editedString = editedString.replace("#~nativeHealthApi~#", 
      (this.platform.is('android')) ? "Google Fit" : 
        (this.platform.is('ios')) ? "HealthKit" : "Health Api");

    return editedString;
  }

  //Fetches a parse object from server when given one, and calls processReceivedTreeObject
  fetchAndProcessPointer(pointer:any) {
    //console.log('Going to fetch:', pointer);
    if (pointer == null || typeof pointer.fetch !== "function") {
      console.log('Pointer is null, likely end of tree.');
      this.chatMessages.push({
        message: "- End of tree -",
        usersMessage: false,
        isWidget: false
      });
      this.setTyping(false);
      return;
    }
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
  replyWithMessage(option:any) {
    //console.log('replyWithMessage', message);
    if (!option.isWidget) {
      let messageObject:any = {
        message: option.message,
        usersMessage: true,
        isWidget: false
      }
      this.saveMessageToParse(messageObject, null, true);
      this.zone.run(() => {
        this.chatMessages.push(messageObject);
      });
      this.scrollToBottom();
      this.zone.run(() => {
        this.replyOptions = [];
      });
      setTimeout(() => {
        this.setTyping(true);
        setTimeout(() => {
          this.fetchAndProcessPointer(option.pointer);
        }, this.TYPING_DELAY);
      }, this.THINKING_DELAY);
    }
  }

  //Passed as a callback function to widgets that were in replies
  widgetCallback(option:any, data?:any) {
    /*if (option.widget.widgetName == 'facebookLogin') {
      for (let i = 0; i < this.recentMessagesTemp.length; i++) {
        this.recentMessagesTemp[i].set(Consts.MESSAGES_USER, Parse.User.current());
      }
      Parse.Object.saveAll(this.recentMessagesTemp, {
        success: (objects) => {
          this.recentMessagesTemp = [];
        },
        error: (error) => {
          console.log('Error saving messages from before user was signed in');
        }
      });
    }*/
    console.log('data', data);
    let messageObject:any = {
      usersMessage: true,
      isWidget: true,
      widget: option.widget
    }
    if (data) {
      messageObject.data = data;
    }
    this.saveMessageToParse(messageObject, null, true);
    this.zone.run(() => {
      this.chatMessages.push(messageObject);
      this.scrollToBottom();
      this.replyOptions = [];
    });
    setTimeout(() => {
      this.setTyping(true);
      setTimeout(() => {
        this.zone.run(() => {
          this.fetchAndProcessPointer(option.pointer);
        });
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

  navigateTreeTo(notesString, insertLine) {
    let TreeObjects:any = Parse.Object.extend(Consts.TREEOBJECTS_CLASS);
    let query:any = new Parse.Query(TreeObjects);
    query.equalTo(Consts.TREEOBJECTS_NOTES, notesString);
    query.first({
      success: (treeObject) => {
        console.log('Got treeObject', treeObject)
        if (insertLine) {
          this.zone.run(() => {
            this.chatMessages.push({
              type:'line'
            });
          });
        }
        setTimeout(() => {
          this.setTyping(true);
          setTimeout(() => {
            this.processReceivedTreeObject(treeObject);
          }, this.TYPING_DELAY);
        }, 0); //this.THINKING_DELAY
      },
      error: (error) => {
        console.log("Error getting root TreeObject", error.message);
        alert('There was an network error, please try again.');
      }
    });
  }

  openUserProfile() {
    if (Parse.User.current() != null) {
      this.nav.push(ProfilePage);
    }
  }

  openCamera() {
      //FROM: http://ionicframework.com/docs/v2/native/Camera/
      
       /**
   * Warning: Using DATA_URL is not recommended! The DATA_URL destination
   * type is very memory intensive, even with a low quality setting. Using it
   * can result in out of memory errors and application crashes. Use FILE_URI
   * or NATIVE_URI instead.
   */
    navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
  }

}
