var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    irc = require('tmi.js'),
    markov = require('markov'),
    request = require("request");

var first = false;
var channelsAttempted = ['reynad27','forsenlol','nl_Kripp','nightblue3','sodapoppin','summit1g', 'c9sneaky', 'tidesoftime', 'trick2g', 'lirik', 'imaqtpie', 'mushisgosu'];
var channelsActive = [];
var numberActive = 0;
var numberResponses = 12;
var channelRecorder = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var activeString = "";
var totalMessages = 0;



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
  channels: ['#reynad27','#forsenlol','#nl_kripp','#nightblue3','#sodapoppin','#summit1g', '#c9sneaky', '#tidesoftime', '#trick2g', '#lirik', '#imaqtpie', '#mushisgosu']
};

var client = new irc.client(options);
client.connect();

function setChannelStatus(channelName, channelIndex){
  numberActive = 0;
  numberResponses = 0;
  try {
    client.api({
      headers:{
        "Client-ID": 'go4lmx06emtd96e1m1mhqvmdcc6cvoi'
      },
      url: "https://api.twitch.tv/kraken/streams/" + channelName
      }, function(err, res, body) {
        if(!err){
          try{
            var streamData = body.stream;
            //var streamData = JSON.parse(body).stream;
            if(streamData != null ){
              channelsActive[channelIndex] = true;
              numberActive++;
              numberResponses++;
            }else{
              channelsActive[channelIndex] = false;
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
      
      //console.log(channel + ": " + cleaned);
      m.seed(cleaned);
     totalMessages++;
    }
    channelRecorder[getChannelIndex(channel)]++;
});

setInterval(function(){
  console.log('Total Messages: ' + totalMessages);
}, 10000);

setInterval(function(){
  //check channels
  if(numberResponses == 12){
    for(var i=0; i<channelsAttempted.length; i++){
       setChannelStatus(channelsAttempted[i], i);
    }
  }else{
      numberResponses = 12;
  }
  //console.log(totalMessages);
}, 10000);

setInterval(function(){
  m = markov(2);
}, 12000000);

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
          //activeString = channelsAttempted[i];
        activeString = "<a target=\"_blank\" href=\"https://twitch.tv/" + channelsAttempted[i] + "\">" + channelsAttempted[i] + "</a>";
        }
        if(activeNum > 0){
          activeString = activeString + "<a>, </a>" + "<a target=\"_blank\" href=\"https://twitch.tv/" + channelsAttempted[i] + "\">" + channelsAttempted[i] + "</a>";
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
    var counter = 0;
    while(!condition){
      var attempt = m.forward(m.pick()).join(' ');
      if(attempt.split(" ").length > 8){
        socket.emit('recieve_markov', attempt);
        condition = true;
      }
      
      if(counter == 200){
        socket.emit('recieve_markov', "ERROR: Try again in 60 seconds");
        condition = true;
      }
      
      console.log(counter);
      counter++;
    }
  });
});

http.listen(process.env.PORT, process.env.IP);