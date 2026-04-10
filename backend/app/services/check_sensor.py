import sys
import time
from gpiozero import DistanceSensor

# ตั้งค่าขา (Trigger=25, Echo=9)
# ปรับ max_distance เป็น 2 เมตร และตั้งค่าเริ่มต้นของเซนเซอร์
ultrasonic = DistanceSensor(echo=9, trigger=25, max_distance=2)

def wait_for_object():
    print("DEBUG: Initial distance reading: {:.2f} cm".format(ultrasonic.distance * 100), file=sys.stderr)
    start_time = time.time() # เก็บเวลาเริ่มต้น
    timeout = 10

    while True:
        # 1. เช็คว่าเจอวัตถุจริงไหม (ระยะน้อยกว่า 5cm ตามที่คุณตั้งไว้)
        if ultrasonic.distance < 0.05:
            print("DETECTED") # เจอของจริง
            sys.stdout.flush()
            break
            
        # 2. เช็คว่าเวลาผ่านไปเกิน 3 วินาทีหรือยัง
        current_time = time.time()
        if (current_time - start_time) > timeout:
            print("DETECTED") 
            sys.stdout.flush()
            break
            
        time.sleep(0.1)

if __name__ == "__main__":
    wait_for_object()