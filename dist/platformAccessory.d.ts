import { PlatformAccessory, CharacteristicGetCallback } from "homebridge";
import { GoveeHomebridgePlatform } from "./platform";
import { GoveeReading } from "govee-bt-client";
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class GoveePlatformAccessory {
    private readonly platform;
    private readonly accessory;
    private readonly reading;
    private LOW_BATTERY_THRESHOLD;
    private HUMIDITY_OFFSET;
    private humiditySensor;
    private temperatureSensor;
    private lastReading;
    constructor(platform: GoveeHomebridgePlatform, accessory: PlatformAccessory, reading: GoveeReading);
    getCurrentRelativeHumidity(callback: CharacteristicGetCallback): void;
    getStatusLowBattery(callback: CharacteristicGetCallback): void;
    getCurrentTemperature(callback: CharacteristicGetCallback): void;
    updateReading(reading: GoveeReading): void;
}
//# sourceMappingURL=platformAccessory.d.ts.map