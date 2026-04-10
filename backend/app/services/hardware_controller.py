import sys
import time
from gpiozero import Servo, OutputDevice
from gpiozero.pins.lgpio import LGPIOFactory

# --- 1. ตั้งค่าพื้นฐาน ---
factory = LGPIOFactory()

servos_pins = {
    101: 12,
    102: 13,
    103: 26
}

# Stepper: PUL=23, Dir=22
stepper_pul = OutputDevice(23, pin_factory=factory)
stepper_dir = OutputDevice(22, pin_factory=factory)

room_config = {
    101: {"steps": 100},
    102: {"steps": 700},
    103: {"steps": 1000}
}

# --- 2. ฟังก์ชันควบคุม Stepper ---
def pulse_stepper(steps, delay=0.005): 
    for _ in range(steps):
        stepper_pul.off() 
        time.sleep(delay)
        stepper_pul.on()
        time.sleep(delay)
        


# --- 3. ฟังก์ชันจัดการ Servo และการคัดแยก ---
def process_sorting(room):
    servo = None
    try:
        if room not in room_config:
            print(f"ERROR: Room {room} not found")
            print("JOB_DONE")
            sys.stdout.flush()
            return

        steps = room_config[room]["steps"]
        servo = Servo(
            servos_pins[room], 
            pin_factory=factory,
            min_pulse_width=0.5/1000,   # ค่าต่ำสุด (0 องศา)
            max_pulse_width=2.5/1000    # ค่าสูงสุด (180 องศา)
        )

        print(f"DEBUG: Opening Servo for Room {room}")
        
        servo.mid() 
        time.sleep(0.8)
        servo.value = None 

        # ลำดับ 2: เดิน Stepper ไปยังห้องเป้าหมาย
        print(f"DEBUG: Stepper moving {steps} steps")
        stepper_dir.off() # กำหนดทิศทางไปข้างหน้า
        pulse_stepper(steps)
        
        time.sleep(2.5) # รอให้พัสดุไหลลงกล่อง

        print(f"DEBUG: Closing Servo")
        servo.min() # กลับไปที่จุดเริ่มต้น (0 องศา)
        time.sleep(0.8)
        servo.value = None 

        print("DEBUG: Stepper returning Home")
        stepper_dir.on() # สลับทิศทางถอยหลัง
        pulse_stepper(steps)
        
        servo.close()
        
        print("JOB_DONE")
        sys.stdout.flush()

    except Exception as e:
        print(f"ERROR: {e}")
        if servo: 
            servo.close()
        print("JOB_DONE")
        sys.stdout.flush()

# --- 4. ส่วนรอรับคำสั่งจาก Node.js ---
time.sleep(0.5)
print("READY")
sys.stdout.flush()

while True:
    line = sys.stdin.readline()
    if line:
        room_str = line.strip()
        if room_str.isdigit():
            process_sorting(int(room_str))
    time.sleep(0.1)