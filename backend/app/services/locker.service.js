const { exec } = require("child_process");

let unlockLocker;

if (process.platform === "linux") {
  const pinMap = {
    101: 17,
    102: 27,
    103: 22,
  };

  unlockLocker = async (lockerNumber) => {
    const pin = pinMap[lockerNumber];

    if (!pin) {
      console.log("Invalid locker number");
      return;
    }

    exec(`gpioset -c gpiochip0 ${pin}=1`, (err) => {
      if (err) {
        console.error("GPIO ON error:", err);
        return;
      }

      setTimeout(() => {
        exec(`gpioset -c gpiochip0 ${pin}=0`);
      }, 3000);
    });

    console.log(`Locker ${lockerNumber} unlocked (gpioset mode)`);
  };
} else {
  unlockLocker = async (lockerNumber) => {
    console.log(`MOCK MODE Unlock locker ${lockerNumber}`);
  };
}

module.exports = { unlockLocker };
