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

// Variables Red
var red = 0;
var tempRed = 0;
var redBettor = '';
var tempRedBettor = '';

// Variables Blue
var blue = 0;
var tempBlue = 0;
var blueBettor = '';
var tempBlueBettor = '';

// Variables - Other
var betstarted = 0;
var userListener = `xxsaltbotxx`;
var balanceFile = `./balance/${BOT_USERNAME}.txt`;
var timestampFile = `./timestamp/${BOT_USERNAME}.txt`;


// Called every time a message comes in
function onMessageHandler (channel, user, message, self) {
  
  // Listen for my own bet and reset variables after delay
  if (user.username.toLowerCase() === BOT_USERNAME.toLowerCase()) { 
    if (message.includes('!red') || message.includes('saltyt1Red') || message.includes('!blue') || message.includes('saltyt1Red')) {
      (async () => {
        betstarted = 2;

        await delay(230000);

        red = 0;
        blue = 0;
        betstarted = 0;
      })();
    }
  }
  
  // Listen for bets starting and then bet after delay
  if (message.includes('!red') || message.includes('saltyt1Red') || message.includes('!blue') || message.includes('saltyt1Red')) {
    if (betstarted === 0) {
      betstarted = 1;

      (async () => {
        await delay.range(154000, 156000); // Bet random times for more natural looking bets
          
        var betInt = math.round(math.random(500, 1500)); // Bet random amount since we're no longer balance tracking

        if (betInt > 1) {
          var betAmount = betInt;
        } else {
          var betAmount = 250;
        }

        if (red > blue) {
          var betColor = 'blue';
        } else {
          var betColor = 'red';
        }

        if (betstarted === 1) {
          client.say(channel, `!${betColor} ${betAmount}`);
          betstarted = 2;
        }
        
      })();
    }
  }


  // Listen for bets
  //TODO: make sure it doesn't subtract twice if bettor does both colors before someone else
  if (message.includes('!red') || message.includes('saltyt1Red')) { // red bettors
    var betsRed = parseInt(message.split(' ')[1]);
    if (betsRed > 1) {
      red = red + betsRed;
      tempRed = betsRed;
      tempRedBettor = user.username;
    }
  }
    if (user.username === userListener) {
      if (message.includes('You already have a bet') || message.includes('You do not have enough') ) { // Subtract invalid bets
        redBettor = message.split(' ')[0].replace(/@/g,'');
        if (tempRedBettor.toLowerCase() === redBettor.toLowerCase()) {
          red = red - tempRed;
        }
      }
    } // END red bettors

  if (message.includes('!blue') || message.includes('saltyt1Blue')) { // blue bettors
    var betsBlue = parseInt(message.split(' ')[1]);
    if (betsBlue > 1) {
      blue = blue + betsBlue;
      tempBlue = betsBlue;
      tempBlueBettor = user.username;
    }
  }
    if (user.username === userListener) {
      if (message.includes('You already have a bet') || message.includes('You do not have enough') ) { // Subtract invalid bets
        blueBettor = message.split(' ')[0].replace(/@/g,'');
        if (tempBlueBettor.toLowerCase() === blueBettor.toLowerCase()) {
          blue = blue - tempBlue;
        }
      }
    } // END blue bettors
  // END Listen for bets


  if (user.username === userListener) { // Only listen to messages from this user

    // Reset at end of betting round
    if (message.includes('Betting has ended')) {
      (async () => {
        red = 0;
        blue = 0;
        betstarted = 2;
        await delay(160000);
        betstarted = 0;
      })();
    }

    // Reset if bets haven't started (in case of game crashes or early surrenders)
    if (message.includes('Betting has not opened')) {
      (async () => {
        red = 0;
        blue = 0;
        betstarted = 2;
        await delay(160000);
        betstarted = 0;
      })();
    }

    // Listen for my own bet, store balance, and reset variables after delay
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
    if (message.includes(`@${BOT_USERNAME} - You have`)) {
      var balanceInt = message.replace(BOT_USERNAME,'').replace(/\D/g,'');
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