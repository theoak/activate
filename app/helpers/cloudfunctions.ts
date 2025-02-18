import {App, Config} from 'ionic-angular';
import {Consts} from './consts';

export class CloudFunctions {

  constructor() {
    Parse.initialize(Consts.PARSE_APPLICATION_ID, Consts.PARSE_JS_KEY);
  }
  
  public static initConversation(callback) {
    Parse.Cloud.run('initConversation', {}, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling initConversations:', error.message);
        callback({}, error);
      }
    });
  }

  public static updateFriends(requestData, callback) {
    Parse.Cloud.run('updateFriends', requestData, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling updateFriends:', error.message);
        callback({}, error);
      }
    });
  }

  public static getWeekHeartData(callback) {
    Parse.Cloud.run('getWeekHeartData', {}, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling getWeekHeartData:', error.message);
        callback({}, error);
      }
    });
  }

  public static getWeekMoodsData(callback) {
    Parse.Cloud.run('getWeekMoodData', {}, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling getWeekMoodsData:', error.message);
        callback({}, error);
      }
    });
  }

  public static stravaActivitiesLastWeek(callback) {
    Parse.Cloud.run('stravaActivitiesLastWeek', {}, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling getWeekHeartData:', error.message);
        callback({}, error);
      }
    });
  }

  public static testGoogle(callback) {
    Parse.Cloud.run('testGoogle', {}, {
      success: (data) => {
        callback(data);
      },
      error: (error) => {
        console.log('Error calling testGoogle:', error.message);
        callback({}, error);
      }
    });
  }

  public static processNutritionImage(requestData, callback) {
    Parse.Cloud.run('processNutritionImage', requestData, {
      success: (data) => {
        //console.log('processNutritionImage success');
        callback(data);
      },
      error: (error) => {
        console.log('Error calling processNutritionImage:', error.message);
        callback({}, error);
      }
    });
  }

  public static saveLocationData(requestData, callback) {
    Parse.Cloud.run('saveLocationData', requestData, {
      success: (data) => {
        //console.log('saveLocationData success');
        callback(data);
      },
      error: (error) => {
        console.log('Error calling saveLocationData:', error.message);
        callback({}, error);
      }
    });
  }

  public static saveWalkingData(requestData, callback) {
    Parse.Cloud.run('saveWalkingData', requestData, {
      success: (data) => {
        //console.log('saveLocationData success');
        callback(data);
      },
      error: (error) => {
        console.log('Error calling saveWalkingData:', error.message);
        callback({}, error);
      }
    });
  }

  public static getTimelineEvents(requestData, callback) {
    Parse.Cloud.run('getTimelineEvents', requestData, {
      success: (data) => {
        //console.log('saveLocationData success');
        callback(data);
      },
      error: (error) => {
        console.log('Error calling getTimelineEvents:', error.message);
        callback({}, error);
      }
    });
  }
  
}