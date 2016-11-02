var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    irc = require('tmi.js'),
    markov = require('markov'),
    request = require("request");

var first = false;
var channelsAttempted = ['reynad27','forsenlol','nl_Kripp','GOPconvention','sodapoppin','summit1g', 'C9Sneaky', 'tidesoftime'];
var channelsActive = [];
var numberActive = 0;
var numberResponses = 8;
var channelRecorder = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var activeString = "";
//var totalMessages = 0;

var m = markov(2);
var res;
var active = false;

var options = {
  options: {
      debug: false
  },
  connection: {
      random: "chat",
      reconnect: true
  },
  identity: {
      username: "Twitchmarkovbot",
      password: "oauth:4q10zdxkedanp3rdwr6fkmb4m3dkeq"
  },
  channels: ['#reynad27','#forsenlol','#nl_Kripp','#tsm_theoddone','#sodapoppin','#summit1g', '#reckful', '#tidesoftime']
};

var client = new irc.client(options);
client.connect();

function setChannelStatus(channelName, channelIndex){
  numberActive = 0;
  numberResponses = 0;
  try {
    client.api({
      url: "https://api.twitch.tv/kraken/streams/" + channelName
      }, function(err, res, body) {
        if(!err){
          try{
            var streamData = JSON.parse(body).stream;
            if(streamData != null ){
              channelsActive[channelIndex] = true;
              numberActive++;
              numberResponses++;
            }else{
              channelsActive[channelIndex] = false
              numberResponses++;
            }
          }catch(err){
            console.log('nnnnn ' + err);
          }
        }
    });
  }catch(err) {
    console.log('error boys: ' + err);
  }

}
function getChannelIndex(channelName){
  for(var i=0; i<channelsAttempted.length; i++){
    if(("#"+channelsAttempted[i])==channelName){
      return i;
    }
  }
  return -1;
}
function divideArray(array){
  for(var i=0; i<array.length; i++){
    array[i] = Math.floor(array[i]/2);
  }
return array;
}

client.on("chat", function (channel, user, message, self) {
    var cleaned = message.substring(message.indexOf(">:") + 1);
    if(cleaned == "!markov"){
      client.say(channel, res);
    }
    if(cleaned.split(" ").length > 5){
      if(user.username == "NightBot"){
        console.log(user);
      }
      m.seed(cleaned);
     //totalMessages++;
    }
    channelRecorder[getChannelIndex(channel)]++;
});

setInterval(function(){
  //check channels
  if(numberResponses == 8){
    for(var i=0; i<channelsAttempted.length; i++){
       setChannelStatus(channelsAttempted[i], i);
    }
  }else{
      console.log('not dr.8 ' + numberResponses);
      numberResponses = 8;
  }
  //console.log(totalMessages);
}, 10000);

setInterval(function(){
    //for seeding and updating res
    var condition = false;
    while(!condition){
      if(1001 > 1000){
        var attempt = m.forward(m.pick(), 30).join(' ');
        if(attempt.split(" ").length > 8){
          res = attempt;
          condition = true;
        }
      }
    }
    /*
    if(totalMessages > 1000000){
      m = markov(2);
      totalMessages = 0;
    }
    */
    
}, 20000);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  
  console.log('connection');
  
  setTimeout(function(){
    socket.emit('newCurrentInfo', activeString);
    socket.emit('togetherData', channelRecorder);
  }, 500);
  
  setInterval(function(){
    activeString = "";
    var activeNum = 0;
    for(var i=0; i<channelsActive.length; i++){
      if(channelsActive[i] == true){
        
        if(activeNum == 0){
          activeString = channelsAttempted[i];
        }
        if(activeNum > 0){
          activeString = activeString + ", " + channelsAttempted[i];
        }
        activeNum++;
      }
    }
    socket.emit('newCurrentInfo', activeString);
  }, 15000)

  if(first==false){
    setInterval(function(){
      channelRecorder = divideArray(channelRecorder);
      io.sockets.emit('togetherData', channelRecorder);
    },20000);
    first = true;
  }

  socket.on('request_markov', function(){
    var condition = false;
    while(!condition){
      var attempt = m.forward(m.pick(), 30).join(' ');
      if(attempt.split(" ").length > 8){
        socket.emit('recieve_markov', attempt);
        condition = true;
        console.log('found markov of 8+ size');
      }
    }
  });
});

http.listen(process.env.PORT, process.env.IP);