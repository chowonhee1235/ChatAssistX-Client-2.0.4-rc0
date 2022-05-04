const WebSocket = require('ws');
const wsport = (typeof process.argv[3] != 'undefined') ? process.argv[3] : 4649;
const wss = new WebSocket.Server({ port: wsport });
const channel = process.argv[2];
let count = 0;
require('colors');

if(typeof process.argv[2] == 'undefined' || process.argv[2] == '') {
    console.log("Usage : npm start <channel id> <port number:default 4649>");
    process.exit(1);
}
console.log("===================================");
console.log("ChatAssistX".green + " Server by Lastorder-DC");
console.log("Distributed by MIT License");
console.log("===================================\n");

console.log("INFO".green + " : ChatAssistX server started");

wss.on('listening', function(ws) {
    console.log("INFO".green + " : Now listening port " + wsport + "...");
})

wss.on('error', function(ws) {
    console.log("ERROR".red + " : Websocket error occured!");
})

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let TAPIC = require('tapic');
let oauth = 'usexgv9w2ikqi1lpx8x94q1dqhh3d9';

function sendConfig() {
    var config = {};
    config.type = "config";
    config.presetName = "default";
    config.platformIcon = true;
    config.platform = "all";
    config.animation = "fade";
    config.chatFade = 30;
    config.font = "Jeju Gothic";
    config.fontUsernameSize = 14;
    config.fontUsernameColor = "255, 255, 255";
    config.fontChatSize = 16;
    config.fontChatColor = "255, 255, 255";
    config.backgroundColor = "255, 255, 255";
    config.backgroundAlpha = 0;
    config.chatBackgroundColor = "100, 100, 100";
    config.chatBackgroundAlpha = 25;
    
    wss.broadcast(JSON.stringify(config));
    setTimeout(sendConfig,5000);
}

function heartbeat() {
  this.isAlive = true;
}

function sendChat(rawbody) {
    var chat = rawbody;
    chat.type = "chat_message";
    chat.platform = 'twitch';
    chat.username = chat.from;
    chat.message = chat.text;
    wss.broadcast(JSON.stringify(chat));
}

sendConfig();

TAPIC.setup(oauth, function (username) {
    TAPIC.joinChannel(channel,function(){
        console.log("INFO".green + " : Connected to channel " + channel);
    });
});

TAPIC.listen('message', event => sendChat(event));


wss.on('connection', function connection(ws) {
    console.log("INFO".green + " : ChatAssist client connected.");
    ws.isAlive = true;
    ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        console.log("INFO : Client disconnected");
        return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);
