const delay = require('delay');
const tmi = require('tmi.js');
const fs = require('fs');
const math = require('mathjs');
const reset = require("../lib/resetHandler.js");
const { onBetopenedHandler } = require("../lib/onBetopenedHandler");

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

// Register our event handlers
client.on('message', onMessageHandler); // Read chat messages
client.on('message', onBetopenedHandler); // Bet calculations
client.on('message', onFarmingHandler); // Farming
client.on('connected', onConnectedHandler); // Initial connection


// Connect to Twitch:
client.connect();

// Variables
var alreadyBet = false;
var timestampFile = `./timestamp/${BOT_USERNAME}.txt`;


// Called every time a message comes in
function onMessageHandler (channel, user, message, self) {
  
  // Listen for my own bet
  if (user.username.toLowerCase() === BOT_USERNAME.toLowerCase()) { 
    if (message.startsWith('!red') || message.startsWith('saltyt1Red') || message.startsWith('!blue') || message.startsWith('saltyt1Red')) {
      (async () => {
        alreadyBet = true;
        await delay(230000);
        alreadyBet = false;
        reset.resetHandler();
      })();
    }
  }

  // Listen for bets starting and then bet after delay
  if (message.startsWith('!red') || message.startsWith('saltyt1Red') || message.startsWith('!blue') || message.startsWith('saltyt1Red')) {
    if (betOpened === true) {
      (async () => {
        await delay.range(149000, 155000); // Bet random timing for more natural looking bets
          
        var betInt = math.round(math.random(5, 15)); // choose random number for bet (will multiply x100)

        if (betInt > 1) {
          var betAmount = betInt * 100; // Multiply * 100 for more natural looking bet
        } else {
          var betAmount = 250; // Fallback bet
        }

        if (red > blue) { // Set whether we bet on underdog or overdog
          var betColor = 'blue';
        } else {
          var betColor = 'red';
        }

        if (betOpened === true && alreadyBet === false) {
          client.say(channel, `!${betColor} ${betAmount}`);
        }
      })();
    }
  }
}


// Auto Farming - Checks every time a message comes in
function onFarmingHandler (channel) {
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
  });
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