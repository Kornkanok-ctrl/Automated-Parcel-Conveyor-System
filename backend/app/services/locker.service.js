let unlockLocker;

if (process.platform === "linux") {
  // ===== Raspberry Pi Mode =====
  const Gpio = require("onoff").Gpio;

  unlockLocker = async (lockerNumber) => {
    const pinMap = {
      1: 17,
      2: 27,
      3: 22,
    };

    const pin = pinMap[lockerNumber];

    if (!pin) {
      console.log("Invalid locker number");
      return;
    }

    const relay = new Gpio(pin, "out");

    relay.writeSync(1);

    setTimeout(() => {
      relay.writeSync(0);
    }, 3000);

    console.log(`Locker ${lockerNumber} unlocked (REAL GPIO)`);
  };
} else {
  // ===== Windows / Dev Mode =====
  unlockLocker = async (lockerNumber) => {
    console.log(`MOCK MODE Unlock locker ${lockerNumber}`);
  };
}

module.exports = { unlockLocker };
