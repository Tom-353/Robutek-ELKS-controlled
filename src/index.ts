import { LED_WS2812, SmartLed } from "smartled"
import * as radio from "simpleradio";
import * as adc from "adc";
import * as gpio from "gpio"
import { Servo } from "./libs/servo.js"
import * as robutek from "./libs/robutek.js"
import { normalize } from "path";
const ledStrip = new SmartLed(48, 1, LED_WS2812);

const SERVO_PIN = 38;
const servo = new Servo(SERVO_PIN, 1, 4);

const BTN_RIGHT = 2;
var target_pos_: number = 512;
var current_pos_: number = 512;
const controller: string = "34:85:18:82:49:a6";

gpio.pinMode(BTN_RIGHT, gpio.PinMode.INPUT); 

var motor_on: boolean = true;
var speed_multiplier: number = 0.5;
const MOVE_SPEED = 350;
const TURN_SPEED = 250;
robutek.leftMotor.move();
robutek.rightMotor.move();

// zapnutí radia, 4 je číslo skupiny. Může být od 0 do 15 včetně.
radio.begin(4);

var received: Array<number>=[];
// řetězce
radio.on("string", (retezec, info) => {
  if (info.address != controller) {
    console.log("ignored " + info.address)
    return;
  }/*
  console.log(
    `Přijal jsem řetězec '${retezec}'.
    Od: ${info.address},
    síla signálu: ${info.rssi})
`
  );*/
function adjust_adc(n: number, tolerance: number = 0.1): number {
  n = 2 * n / 1023;
  n = n - 1;
  if (n > -tolerance && n < tolerance) n = 0;
  return n;
}
function round(n: number, rounding: number = 1): number {
  return n-n%rounding;
}

  if (retezec[0]=="P") {
    const retezec_split = retezec.substring(1).split(";");
    for (let i = 0; i < retezec_split.length; i++) {
      received[i] = parseInt(retezec_split[i]);
    }
    target_pos_ = received[2]
    speed_multiplier = received[3]/1023;
    const forward = -adjust_adc(received[0]);
    const turning = adjust_adc(received[1])
    robutek.leftMotor .setSpeed((forward*MOVE_SPEED+turning*TURN_SPEED)*speed_multiplier);
    robutek.rightMotor.setSpeed((forward*MOVE_SPEED-turning*TURN_SPEED)*speed_multiplier);
    /*if (received[3] < 150) {
      if (motor_on){
        motor_on = false;
        robutek.leftMotor.stop();
        robutek.rightMotor.stop();
      }
    }
    else if (!motor_on) {
        motor_on = true;
        robutek.leftMotor.move();
        robutek.rightMotor.move();
    }*/
    servo.write(received[2]);
    console.log(received);
  }
});
var LED_colour = { r: 50, g: 30, b: 0 };
var LED_on: boolean = false;
/*
setInterval(() => { // pravidelně vyvolává událost
  const strength: number = 0.08;
  current_pos_ = (target_pos_*strength + current_pos_*(1-strength));
  servo.write(current_pos_);
}, 15);
*/
setInterval(() => { // pravidelně vyvolává událost
  ledStrip.clear();
  if (LED_on) ledStrip.set(0, LED_colour);
  ledStrip.show();
  LED_on =! LED_on;
}, 1000); 