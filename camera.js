'strict mode';

const fs = require('fs');
const AWS = require('aws-sdk');
const RaspiCam = require('raspicam');
const IotDevice = require('aws-iot-device-sdk');

AWS.config.region = 'us-east-1';
var config = {AWS_S3_BUCKET:'jessicaphotobucket'};

var camera = new RaspiCam({
    mode: "photo",
    output: "./photos/photo.jpg",
    encoding: 'jpg',,
    rot:"90",
    timeout: 0
});
var s3 = new AWS.S3({ region:AWS.config.region });
var s3Params = {
  Key:'photo.jpg',
  Body:fs.createReadStream('./photos/photo.jpg'),
  Bucket:config.AWS_S3_BUCKET,
  ACL:'public-read-write'
}

var Jessica = IotDevice.device({
  keyPath:'./credentials/3fda9f54ea-private.pem.key',
  certPath:'./credentials/3fda9f54ea-certificate.pem.crt',
  caPath:'./credentials/root.pem',
  clientId:'JessicaCamera',
  host:'a1gptjpcib99ew.iot.us-east-1.amazonaws.com',
  regions:'us-east-1'
})

Jessica.on('connect',function(){
  console.log('Jessica Connected to AWS IOT');
  makeCamera();
  Jessica.subscribe('action_take_photo');
});

Jessica.on('message',function(topic,payload){
  console.log('Topic :',topic, 'Payload: ',payload.toString());
  if(topic ==='action_take_photo'){
    camera.start();
  }
});

function makeCamera() {
    camera.on("start", function(err, timestamp){
        console.log('--> Camera Started @ ', timestamp)
    });
    camera.on('read', function(err, timestamp, filename){
        console.log('--> Camera Reading:')
        console.log(timestamp);
        console.log(filename);
        camera.stop();
    });
    camera.on('stop', function(){
        console.log('--> Camera Stopped');
    });
    camera.on('exit', function(timestamp){
        console.log('--> Camera Exited @ ', timestamp);
        s3.upload(s3Params,(err,data)=>{
          console.log(err,data)
        });
    });
}
