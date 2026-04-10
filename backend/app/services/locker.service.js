const { exec } = require("child_process");

let unlockLocker;

if (process.platform === "linux") {
  const pinMap = {
    101: 15,
    102: 18,
    103: 24,
  };

  unlockLocker = async (lockerNumber) => {
    const pin = pinMap[lockerNumber];

    if (!pin) {
      console.error(`Invalid locker number: ${lockerNumber}`);
      return;
    }

    exec(`sudo pinctrl set ${pin} op dh`, (err) => {
      if (err) {
        console.error(`GPIO ON error (Pin ${pin}):`, err);
        return;
      }

      console.log(`Locker ${lockerNumber} (Pin ${pin}) unlocked via pinctrl`);

      setTimeout(() => {
        exec(`sudo pinctrl set ${pin} op dl`, (err) => {
          if (err) {
            console.error(`GPIO OFF error (Pin ${pin}):`, err);
          } else {
            console.log(`Locker ${lockerNumber} locked back.`);
          }
        });
      }, 3000);
    });
  };
} else {
  unlockLocker = async (lockerNumber) => {
    console.log(`MOCK MODE Unlock locker ${lockerNumber}`);
  };
}

module.exports = { unlockLocker };