const { spawn } = require('child_process');
const path = require('path');

let isBusy = false;
const pythonPath = path.resolve(__dirname, 'hardware_controller.py');

const pyMain = spawn('python3', ['-u', pythonPath]); 
pyMain.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    console.log(`[RAW Python]: "${msg}"`);

    if (msg.includes("READY")) {
        console.log("--- Hardware Controller is Standby ---");
    }
    if (msg.includes("JOB_DONE")) {
        isBusy = false;
        console.log("[Service]: มอเตอร์ว่างพร้อมรับงานถัดไป");
    }
});

pyMain.stderr.on('data', (data) => {
    console.error(`[Python Error]: ${data.toString()}`);
});

module.exports = {
    isHardwareReady: () => !isBusy,
    moveMotors: (roomNumber) => {
        if (isBusy) {
            console.log("[Service]: ปฏิเสธคำสั่ง! เครื่องกำลังทำงานอยู่");
            return false;
        }
        
        if (pyMain.stdin.writable) {
            isBusy = true; // ล็อคสถานะทันทีที่สั่งงาน
            pyMain.stdin.write(roomNumber + "\n");
            return true;
        }
        return false;
    },
    startSensorCheck: () => {
        return spawn('python3', [path.join(__dirname, 'check_sensor.py')]);
    }
};