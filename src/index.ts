import { LED_WS2812, SmartLed } from "smartled"
import * as radio from "simpleradio";
import { Servo } from "./libs/servo.js"
import * as robutek from "./libs/robutek.js"
import * as colors from "./libs/colors.js"

const ledStrip = new SmartLed(48, 1, LED_WS2812);

const SERVO_PIN = 38;
const servo = new Servo(SERVO_PIN, 1, 4);

const MOVE_SPEED = 350;
const TURN_SPEED = 250;

var controller: string = ""; // Zde můžete napsat adresu svého ovladače
if (controller == "") {
  ledStrip.set(0, colors.red);
}
else {
  ledStrip.set(0, colors.green);
}
ledStrip.show();

/** Upraví rozsah z adc do rozsahu od -1 do 1. */
function adjust_adc(n: number, tolerance: number = 0.1): number {
  n = 2 * n / 1023;
  n = n - 1;
  if (n > -tolerance && n < tolerance) n = 0;
  return n;
}

radio.begin(4);

robutek.leftMotor.move();
robutek.rightMotor.move();

// řetězce
radio.on("string", (retezec, info) => {
  // Zapamatuje si první ovladač, který pošle řetězec začínající na C.
  if (controller == "" && retezec[0]=="C") {
    controller = info.address;
    console.log("connected to " + info.address);
    radio.sendString("connected to " + info.address);
    ledStrip.set(0, colors.green);
    ledStrip.show();
    return;
  }
  // Ignoruje ovládání z cizího ovladače.
  if (info.address != controller) {
    console.log("ignored " + info.address);
    return;
  }
  // Příjem příkazů
  if (retezec[0]=="P") {
    // Dokódování řetězce
    const retezec_split = retezec.substring(1).split(",");
    const received: Array<number> = [];
    for (let i = 0; i < retezec_split.length; i++) {
      received[i] = parseInt(retezec_split[i]);
    }
    // Použití přijmutých příkazů
    const speed_multiplier = received[3]/1023;
    const forward = -adjust_adc(received[0]);
    const turning = adjust_adc(received[1])
    robutek.leftMotor .setSpeed((forward*MOVE_SPEED+turning*TURN_SPEED)*speed_multiplier);
    robutek.rightMotor.setSpeed((forward*MOVE_SPEED-turning*TURN_SPEED)*speed_multiplier);
    servo.write(received[2]);
    console.log(received);
  }
});