'use strict';

//Environment Configuration
const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');

let config = {};
config.IOT_BROKER_ENDPOINT = "a1gptjpcib99ew.iot.us-east-1.amazonaws.com".toLowerCase();
config.IOT_BROKER_REGION = "us-east-1";
config.IOT_THING_NAME = "JessicaCamera";

//Initializing client for IoT
let iotData = new AWS.IotData({
    endpoint: config.IOT_BROKER_ENDPOINT
});


const languageStrings = {
    'en': {
        translation: {
            COMPLIMENTS: [
                'Nice Teeth',
                'Nice Hair',
                'Nice Smile',
                'Nice Stature'
            ],
            SKILL_NAME: 'Take a picture',
            GET_Photo_MESSAGE: "Here's your Photo: ",
            HELP_MESSAGE: 'You can say tell me take a photo, or take a picture.',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },

};

const handlers = {
    'LaunchRequest': function() {
        this.emit('GetPhoto');
    },
    'GetNewPhotoIntent': function() {
        this.emit('GetPhoto');
    },
    'GetPhoto': function() {
        // Get a random space Photo from the space Photos list
        // Use this.t() to get corresponding language data
        const Compliments = this.t('COMPLIMENTS');
        const ComplimentIndex = Math.floor(Math.random() * Compliments.length);
        const randomCompliment = Compliments[ComplimentIndex];

        //Set the camera to 1 for activation on the device
        let payloadObj = {
          "state":{"desired":{"camera": 1}}
        };
        //Prepare the parameters of the update call
        let IotParamsUpdate = {
          thingName: config.IOT_THING_NAME,
          payload: JSON.stringify(payloadObj)
        };

        // Publish to topic
        iotData.publish({
          topic:'action_take_photo',
          payload:JSON.stringify(payloadObj),
          qos:0
        },(err,data)=>{
          console.log('After Publish: ',err,data);
        });

        //Update Device Shadow
        iotData.updateThingShadow(IotParamsUpdate, function(err, data) {
          if (err) {
              //Handle the error here
              speechOutput = "The camera has NOT been activated!";
              console.log(err);
          } else {
              speechOutput = "The camera has been activated!";
              console.log(data);
              callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
          }
        });



        // Create speech output
        const speechOutput = this.t('GET_Photo_MESSAGE') + randomCompliment;
        this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), randomCompliment);
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function(event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
