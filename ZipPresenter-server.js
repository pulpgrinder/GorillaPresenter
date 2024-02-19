// fronkensteen-server.js. Proxy for Fronkensteen development.
// Copyright 2019-2020 by Anthony W. Hursh
// MIT License

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path')
const http = require('http');
const https = require('https');
const {SHA3} = require('sha3');
const express = require('express');
const readlineSync = require('readline-sync')

let remoteREPL = {
  server:null,
  webport:8000,
  replport:5900,
  commport:5901,
  replsocket:null,
  replclient:null,
  commsocket:null,
  commclient:null,
  passPhrase:"",
  errors:"",
  addError: function(errormsg){
    remoteREPL.errors = remoteREPL.errors + errormsg + "\n"
  },
  checkSig: function(string,passphrase,signature){
    let hash = new SHA3(512);
    hash.update(string + passphrase);
    let sigcheck = hash.digest('hex');
    if(sigcheck !== signature){
      return false;
    }
    return true;
  },
  sendClient:function(message){
    if(remoteREPL.commclient === null){
      console.log("No client connected.");
    }
    else {
        remoteREPL.commclient.send(message);
    }
  },
  sendREPL:function(message){
    if(remoteREPL.replclient === null){
      console.log("No REPL connected.");
      remoteREPL.sendClient(JSON.stringify({"result":"","signature":"","status":"No REPL connected."}));
    }
    else {
        remoteREPL.replclient.send(message);
    }
  },
  start: function(){
      let self = this;
      let serverOptions = {
        maxage:0,
        setHeaders: function (res, path, stat) {
      
        }
      };
      let app = express();
      app.use(express.static(path.join(__dirname, 'dist'),serverOptions))
      let httpServer = http.createServer(app);
      httpServer.listen(remoteREPL.webport,'0.0.0.0');;
      let replServer = http.createServer(app);
      replServer.listen(remoteREPL.replport,'0.0.0.0')
      let commServer = http.createServer(app)
      commServer.listen(remoteREPL.commport,'0.0.0.0')
      remoteREPL.passPhrase = readlineSync.question('Enter passphrase for remote REPL clients:  ', {
          hideEchoBack: true
      });
      remoteREPL.replsocket = new WebSocket.Server({server:replServer});
      remoteREPL.replsocket.on('connection', function connection(ws) {
          remoteREPL.replclient = ws;
          remoteREPL.replclient.on('message', function incoming(message) {
            let parsedMessage = JSON.parse(message);
            let signature = parsedMessage['signature'];
            let result = parsedMessage['result'];
            console.log("result from REPL: " + result);
            if((signature === undefined) || (result === undefined)){
              console.log("Bad message from REPL: " + parsedMessage);
              return;
            }
            if(self.checkSig(result, remoteREPL.passPhrase,signature) === true){
              parsedMessage.status = "OK";
            }
            else {
              console.log("Invalid signature from REPL! Check passphrase.");
              parsedMessage.result = "";
              parsedMessage.signature = "";
              parsedMessage.status = "Invalid signature from REPL interpreter. Check passphrase.";
            }
            self.sendClient(JSON.stringify(parsedMessage));
          });
        })
    remoteREPL.commsocket = new WebSocket.Server({server:commServer});
    remoteREPL.commsocket.on('connection', function connection(ws) {
        remoteREPL.commclient = ws;
        remoteREPL.commclient.on('message', function incoming(message) {
          let parsedMessage = JSON.parse(message);
          let signature = parsedMessage['signature'];
          let expr = parsedMessage['expr'];
          console.log("expr from client: " + expr)
          if((expr === undefined) || (signature === undefined)){
            console.log("Bad message from client: " + parsedMessage);
            self.sendClient(JSON.stringify({"result":"","signature":"","status":"Bad message from client: " + message}))
            return;
          }
          if(self.checkSig(expr,remoteREPL.passPhrase,signature) === true){
            parsedMessage.status = "OK"
            self.sendREPL(JSON.stringify(parsedMessage));
          }
          else {
              console.log("Invalid signature from remote connection! Check passphrase.");
              self.sendClient(JSON.stringify({"result":"","signature":"","status":"Bad passphrase"}))
          }
      });
    })
  }
}

remoteREPL.start();
console.log("Web server running on port " + remoteREPL.webport)
console.log("Remote REPL running on port " + remoteREPL.replport + " (app), " + remoteREPL.commport + " (remote client).")
