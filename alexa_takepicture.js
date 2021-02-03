//Environment Configuration
var config = {};

config.IOT_BROKER_ENDPOINT      = "a1gptjpcib99ew.iot.us-east-1.amazonaws.com".toLowerCase();
config.IOT_BROKER_REGION        = "us-east-1";
config.IOT_THING_NAME           = "berrycamera";

//Loading AWS SDK libraries

var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT

var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

/**
 * Activate the camera using AWS IoT Device Shadow
 */

 function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
     return {
         outputSpeech: {
             type: 'PlainText',
             text: output,
         },
         card: {
             type: 'Simple',
             title: `SessionSpeechlet - ${title}`,
             content: `SessionSpeechlet - ${output}`,
         },
         reprompt: {
             outputSpeech: {
                 type: 'PlainText',
                 text: repromptText,
             },
         },
         shouldEndSession,
     };
 }

 function buildResponse(sessionAttributes, speechletResponse) {
     return {
         version: '1.0',
         sessionAttributes,
         response: speechletResponse,
     };
 }

 function takephoto(intent, session, callback) {

     var repromptText = null;
     var sessionAttributes = {};
     var shouldEndSession = true;
     var speechOutput = "";

     //Set the camera to 1 for activation on the device
     var payloadObj={ "state":

                           { "desired":

                                    {"camera":1}

                           }

                  };
     //Prepare the parameters of the update call
     var paramsUpdate = {
         "thingName" : config.IOT_THING_NAME,
         "payload" : JSON.stringify(payloadObj)
     };
     //Update Device Shadow

     iotData.updateThingShadow(paramsUpdate, function(err, data) {
       if (err){

         //Handle the error here
         speechOutput = "The camera has NOT been activated!";

         console.log(err);

       }

       else {

         speechOutput = "The camera has been activated!";

         console.log(data);

         callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

       }

     });
 }

exports.handler = exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            takephoto(event.request,event.session,(sessionAttributes, speechletResponse) => {
                callback(null, buildResponse(sessionAttributes, speechletResponse));
            });
        }
    } catch (err) {
        callback(err);
    }
};
