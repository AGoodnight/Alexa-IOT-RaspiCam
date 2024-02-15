#!/usr/bin/env node

'strict mode';

const fs = require('fs');
const AWS = require('aws-sdk');
const RaspiCam = require('raspicam');
const IotDevice = require('aws-iot-device-sdk');
const path = require('path');
const moment = require('moment');

var _now = moment.now();
var _filename = 'photo-'+_now+'.jpg';
var _bucket = "jessicaphotobucket";
var _client_id = "JessicaCamera";
var s3Params = {};
var camera = null;

// S3 Access
AWS.config.loadFromPath('./aws_config.json');

// Hardware Camera
var s3 = new AWS.S3({ region:AWS.config.region });

// IOT access
var Jessica = IotDevice.device({
  keyPath:'3fda9f54ea-private.pem.key',
  certPath:'3fda9f54ea-certificate.pem.crt',
  caPath:'root.pem',
  clientId:_client_id,
  host:'a1gptjpcib99ew.iot.us-east-1.amazonaws.com',
  regions:'us-east-1'
})

// IOT Events
Jessica.on('connect',function(){
  console.log('Jessica Connected to AWS IOT');
  makeCamera();
  Jessica.subscribe('action_take_photo');
  Jessica.publish('init_started',JSON.stringify({
    init:true
  }));
});

Jessica.on('message',function(topic,payload){
  console.log('Topic :',topic, 'Payload: ',payload.toString());
  if(topic ==='action_take_photo'){
    camera.start();
  }
});

// Camera Instance Constructor
function makeCamera() {
    _now = moment.now();
    _filename = 'photo-'+_now+'.jpg';
    camera = new RaspiCam({
        mode: "photo",
        output: path.join(__dirname,'/photos/'+_filename),
        encoding: 'jpg',
        rot:"270",
        timeout: 0
    });
    camera.on("start", function(err, timestamp){
        console.log('--> Camera Started @ ', timestamp)
    });
    camera.on('read', function(err, timestamp, filename){
        console.log('--> Camera Reading:')
        console.log(timestamp);
        console.log(filename);
        _filename = filename;
        camera.stop();
    });
    camera.on('stop', function(){
        console.log('--> Camera Stopped');
        upload();
    });
    camera.on('exit', function(timestamp){
        console.log('--> Camera Exited @ ', timestamp);
    });
}

function upload(){
  s3Params = {
    Key:_filename,
    Body:fs.createReadStream(path.join(__dirname,'/photos/'+_filename)),
    Bucket:_bucket,
    ACL:'public-read-write'
  }
  s3.upload(s3Params,(err,data)=>{
    if(err){
      console.log('Upload FAILED',err);
    }else{
      console.log('Upload WORKED');
    }
  });
}
