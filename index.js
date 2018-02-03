let RaspiCam = require("raspicam");
let awsIot = require('aws-iot-device-sdk');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
let camera = new RaspiCam({
		mode:'photo',
		output:'photo/image%06d.jpg',
		rotation:'90',
		encoding: "jpg"
});

let device = awsIot.device({
   keyPath: '/credentials',
  certPath: '/credentials',
    caPath: '/credentials',
  clientId: "Rhubarb",
      host: "arn:aws:iot:us-east-1:696610291095:thing/Rhubarb"
});


//to take a snapshot, start a timelapse or video recording
camera.start( );

//to stop a timelapse or video recording
camera.stop( );

//listen for the "start" event triggered when the start method has been successfully initiated
camera.on("start", function(){
	//do stuff
});

//listen for the "read" event triggered when each new photo/video is saved
camera.on("read", function(err, timestamp, filename){
	//do stuff
});

//listen for the "stop" event triggered when the stop method was called
camera.on("stop", function(){
	//do stuff
});

//listen for the process to exit when the timeout has been reached
camera.on("exit", function(){
	//do stuff
});
//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
    device.publish('topic_2', JSON.stringify({ test_data: 1}));
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
