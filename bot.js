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

// Variables
var red = 0;
var blue = 0;
var betstarted = 0;
var userListener = `xxsaltbotxx`;
var balanceFile = `./balance/${BOT_USERNAME}.txt`;
var timestampFile = `./timestamp/${BOT_USERNAME}.txt`;


// Called every time a message comes in
function onMessageHandler (channel, user, message, self) {
  if (self) { return; } // Ignore messages from myself
  
  if (user.username === userListener) { // Only listen to messages from this user
  
    // Listen for bets starting and then bet after delay
    if (message.includes('bet submitted for')) {
      if (betstarted === 0) {
        betstarted = 1;

        (async () => {
          await delay.range(150000, 160000); // Bet random times for more natural looking bets
          
          fs.readFile(balanceFile, 'utf8', function (err,data) {
            if (err) return console.log(err);
            
            var betInt = math.round(data*0.015); // Bet 1.5% of stored balance

            if (betInt > 1) { // Set in case of errors
              var betAmount = betInt;
            } else {
              var betAmount = 250;
            }

            if (red > blue) { // Bet for red or blue, whichever has less bets
              var betColor = 'blue';
            } else {
              var betColor = 'red';
            }

            if (betstarted === 1) { // Set to prevent multi betting
              client.say(channel, `!${betColor} ${betAmount}`);
            }
          });
          
        })();
      }
    }

    // Listen for Red bets
    if (message.includes('RED bet submitted for')) {
      var betsRed = parseInt(message.split(' ')[6]);
      red = red + betsRed;
    }

    // Listen for Blue bets
    if (message.includes('BLUE bet submitted for')) {
      var betsBlue = parseInt(message.split(' ')[6]);
      blue = blue + betsBlue;
    }

    // Reset at end of betting round
    if (message.includes('Betting has ended for this round')) {
      red = 0;
      blue = 0;
      betstarted = 0;
    }

    // Reset if bets haven't started (in case of game crashes or early surrenders)
    if (message.includes('Betting has not opened yet')) {
      red = 0;
      blue = 0;
      betstarted = 0;
    }

    // Listen for my own bet, store balance, and reset globals after delay
    if (message.includes(`@${BOT_USERNAME} - RED bet submitted for`) || message.includes(`@${BOT_USERNAME} - BLUE bet submitted for`)) {
      var balanceInt = parseInt(message.split(' ')[11]);
      fs.writeFile(balanceFile, balanceInt.toString(), function (err) {
        if (err) return console.log(err);
      });
      (async () => {
        betstarted = 2;

        await delay(230000);

        red = 0;
        blue = 0;
        betstarted = 0;
      })();
    }

    // Listen for balance and store balance
    if (message.includes(`@${BOT_USERNAME} - You've`)) {
      var balanceInt = parseInt(message.split(' ')[3].replace(/./g,''));
      fs.writeFile(balanceFile, balanceInt.toString(), function (err) {
        if (err) return console.log(err);
      });
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