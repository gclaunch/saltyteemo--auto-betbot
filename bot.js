const delay = require('delay');
const tmi = require('tmi.js');
const fs = require('fs');
const math = require('mathjs');

// Define configuration options
var BOT_USERNAME = '';
var OAUTH_TOKEN = 'oauth:';

const opts = {
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [ 'saltyteemo' ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);


// Connect to Twitch:
client.connect();

// Variables - Red
var red = 0;
var tempRed = 0;
var tempRedBettor;

// Variables - Blue
var blue = 0;
var tempBlue = 0;
var tempBlueBettor;

// Variables - Other
var betOpened = false;
var alreadyBet = false;
var userListener = `xxsaltbotxx`;
var timestampFile = `./timestamp/${BOT_USERNAME}.txt`;


// Called every time a message comes in
function onMessageHandler (channel, user, message, self) {
  
  // Listen for my own bet and reset variables after delay
  if (user.username.toLowerCase() === BOT_USERNAME.toLowerCase()) { 
    if (message.startsWith('!red') || message.startsWith('saltyt1Red') || message.startsWith('!blue') || message.startsWith('saltyt1Red')) {
      alreadyBet = true;
    }
  }
  
  // Listen for bets starting and then bet after delay
  if (message.startsWith('!red') || message.startsWith('saltyt1Red') || message.startsWith('!blue') || message.startsWith('saltyt1Red')) {
    if (betOpened === false) {
      var betCheck = parseInt(message.split(' ')[1]); // check if a bet vs an emote
      if (betCheck > 1) {
        betOpened = true;

        (async () => {
          await delay.range(154000, 156000); // Bet random timing for more natural looking bets
            
          var betInt = math.round(math.random(5, 15)); // choose random number for bet

          if (betInt > 1) {
            var betAmount = betInt * 100; // Multiply * 100 for more natural looking bet
          } else {
            var betAmount = 250; // Fallback bet
          }

          if (red > blue) {
            var betColor = 'blue';
          } else {
            var betColor = 'red';
          }

          if (betOpened === true && alreadyBet === false) {
            client.say(channel, `!${betColor} ${betAmount}`);
          }          
        })();

        (async () => {
          await delay(180000);
          red = 0;
          blue = 0;
          alreadyBet = false;
          betOpened = false;
        })();
      }
    }
  }


  // Listen for bets
  if (message.startsWith('!red') || message.startsWith('saltyt1Red')) { // red bettors
    var betsRed = parseInt(message.split(' ')[1]);
    if (betsRed > 1) {
      red = red + betsRed;
      tempRed = betsRed;
      tempRedBettor = user.username.toLowerCase();
    }
  }

  if (message.startsWith('!blue') || message.startsWith('saltyt1Blue')) { // blue bettors
    var betsBlue = parseInt(message.split(' ')[1]);
    if (betsBlue > 1) {
      blue = blue + betsBlue;
      tempBlue = betsBlue;
      tempBlueBettor = user.username.toLowerCase();
    }
  }
  // END Listen for bets


  if (user.username === userListener) { // Only listen to messages from this user

    // Subtract invalid bets
    //TODO: make sure it doesn't subtract twice if bettor does both colors before someone else
    if (message.includes('You already have a bet') || message.includes('You do not have enough') ) {
      var bettor = message.split(' ')[0].replace(/@/g,'').toLowerCase(); // Get @username
      if (bettor === tempRedBettor) { // Compare @username with earlier tempbettor username
        red = red - tempRed; //subtract
      }
      if (bettor === tempBlueBettor) {
        blue = blue - tempBlue;
      }
    }

    // Reset at end of betting round -or- if bets haven't started (in case of game crashes or early surrenders)
    if (message.includes('Betting has ended') || message.includes('Betting has not opened')) {
      red = 0;
      blue = 0;
      betOpened = false;
      alreadyBet = false;
    }
    
  } // END UserListener
  
  // Auto Farming
  let timeNow = math.floor(Date.now()/1000); // timestamp converted to seconds

  fs.readFile(timestampFile, 'utf8', function (err,timestamp) {
    if (err) return console.log(err);
    let timeOld = math.chain(timestamp).add(18000).done(); // Set to wait 18000 seconds (5 hours)

    if (timeOld < timeNow) {
      fs.writeFile(timestampFile, timeNow.toString(), function (err) {
        if (err) return console.log(err);

        (async () => {
          await delay.range(5000, 60000); // Set random times for more natural looking farming
          
          client.say(channel, `!farm`);
        })();
      });
    }
  }); // End Farming
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  let date_ob = new Date();
  let month_ob = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let day_ob = ("0" + date_ob.getDate()).slice(-2);
  let hours_ob = ("0" + date_ob.getHours()).slice(-2);
  let minutes_ob = ("0" + date_ob.getMinutes()).slice(-2);
  
  console.log(`${month_ob}/${day_ob} [${hours_ob}:${minutes_ob}] ## ${BOT_USERNAME} Connected to ${addr}:${port}`);
}