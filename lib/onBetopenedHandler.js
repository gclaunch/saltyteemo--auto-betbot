const delay = require('delay');
const reset = require("./resetHandler.js");

// Variables - Red
global.red = 0;
global.tempRed = 0;
global.tempRedBettor;

// Variables - Blue
global.blue = 0;
global.tempBlue = 0;
global.tempBlueBettor;

// Variables - Other
global.betOpened = false;
global.userListener = `xxsaltbotxx`;


// Called every time a message comes in
function onBetopenedHandler(channel, user, message) {

  // Listen for bets starting
  if (message.startsWith('!red') || message.startsWith('saltyt1Red') || message.startsWith('!blue') || message.startsWith('saltyt1Red')) {
    if (betOpened === false) {
      var betCheck = parseInt(message.split(' ')[1]); // check if a bet vs an emote
      if (betCheck > 1) {
        (async () => {
          betOpened = true;
          await delay(230000);
          reset.resetHandler(); // close bets and reset variables after 230 seconds
        })();
      }
    }
  }

  // Listen for bets
  if (message.includes('!red') || message.includes('saltyt1Red')) { // red bettors
    var betsRed = parseInt(message.split(' ')[1]);
    if (betsRed > 1) {
      red = red + betsRed;
      tempRed = betsRed;
      tempRedBettor = user.username.toLowerCase();
    }
  }

  if (message.includes('!blue') || message.includes('saltyt1Blue')) { // blue bettors
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
    if (message.includes('You already have a bet') || message.includes('You do not have enough')) {
      var bettor = message.split(' ')[0].replace(/@/g, '').toLowerCase();
      if (bettor === tempRedBettor) {
        red = red - tempRed;
      }
      if (bettor === tempBlueBettor) {
        blue = blue - tempBlue;
      }
    }

    // Reset at end of betting round -or- if bets haven't started (in case of game crashes or early surrenders)
    if (message.includes('Betting has ended') || message.includes('Betting has not opened') || message.includes('It is over') || message.includes('It is not available')) {
      reset.resetHandler();
    }

  } // END UserListener

}
exports.onBetopenedHandler = onBetopenedHandler;
