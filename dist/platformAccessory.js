"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoveePlatformAccessory = void 0;
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
class GoveePlatformAccessory {
    constructor(platform, accessory, reading) {
        this.platform = platform;
        this.accessory = accessory;
        this.reading = reading;
        this.LOW_BATTERY_THRESHOLD = 25;
        this.HUMIDITY_OFFSET = 0;
        this.lastReading = reading;
        if (!accessory.context.device) {
            throw new Error("Missing device context");
        }
        const deviceContext = accessory.context.device;
        if (accessory.context.batteryThreshold) {
            this.LOW_BATTERY_THRESHOLD = accessory.context.batteryThreshold;
        }
        if (accessory.context.humidityOffset) {
            this.HUMIDITY_OFFSET = accessory.context.humidityOffset;
        }
        // set accessory information
        const accessoryInformationService = this.accessory.getService(this.platform.Service.AccessoryInformation);
        accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(this.platform.Characteristic.Manufacturer, "Govee").setCharacteristic(this.platform.Characteristic.Model, deviceContext.model);
        if (deviceContext.address && deviceContext.address !== "") {
            accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(this.platform.Characteristic.SerialNumber, deviceContext.address);
        }
        // get the HumiditySensor service if it exists, otherwise create a new HumiditySensor service
        // you can create multiple services for each accessory
        this.humiditySensor =
            this.accessory.getService(this.platform.Service.HumiditySensor) ||
                this.accessory.addService(this.platform.Service.HumiditySensor);
        this.humiditySensor.setCharacteristic(this.platform.Characteristic.Name, deviceContext.model);
        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Lightbulb
        this.humiditySensor
            .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
            .on("get", this.getCurrentRelativeHumidity.bind(this));
        this.humiditySensor
            .getCharacteristic(this.platform.Characteristic.StatusLowBattery)
            .on("get", this.getStatusLowBattery.bind(this));
        this.temperatureSensor =
            this.accessory.getService(this.platform.Service.TemperatureSensor) ||
                this.accessory.addService(this.platform.Service.TemperatureSensor);
        this.temperatureSensor
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .on("get", this.getCurrentTemperature.bind(this));
        this.temperatureSensor
            .getCharacteristic(this.platform.Characteristic.StatusLowBattery)
            .on("get", this.getStatusLowBattery.bind(this));
        this.battery =
            this.accessory.getService(this.platform.Service.Battery) ||
                this.accessory.addService(this.platform.Service.Battery);
        this.battery
            .getCharacteristic(this.platform.Characteristic.BatteryLevel)
            .on("get", this.getBatteryLevel.bind(this));
        this.battery
            .getCharacteristic(this.platform.Characteristic.StatusLowBattery)
            .on("get", this.getStatusLowBattery.bind(this));
    }
    getCurrentRelativeHumidity(callback) {
        var _a, _b;
        this.platform.log.debug("getCurrentRelativeHumidity", (_a = this.lastReading) === null || _a === void 0 ? void 0 : _a.humidity, "offset", this.HUMIDITY_OFFSET);
        callback(null, ((_b = this.lastReading) === null || _b === void 0 ? void 0 : _b.humidity) + this.HUMIDITY_OFFSET);
    }
    getBatteryLevel(callback) {
        var _a;
        this.platform.log.debug("getBatteryLevel");
        callback(null, (_a = this.lastReading) === null || _a === void 0 ? void 0 : _a.battery);
    }
    getStatusLowBattery(callback) {
        var _a;
        this.platform.log.debug("getStatusLowBattery");
        callback(null, ((_a = this.lastReading) === null || _a === void 0 ? void 0 : _a.battery) <= this.LOW_BATTERY_THRESHOLD);
    }
    getCurrentTemperature(callback) {
        var _a, _b;
        this.platform.log.debug("getCurrentTemperature", (_a = this.lastReading) === null || _a === void 0 ? void 0 : _a.tempInC);
        callback(null, (_b = this.lastReading) === null || _b === void 0 ? void 0 : _b.tempInC);
    }
    updateReading(reading) {
        this.lastReading = reading;
        this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity + this.HUMIDITY_OFFSET);
        this.temperatureSensor.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.tempInC);
        this.battery.updateCharacteristic(this.platform.Characteristic.BatteryLevel, reading.battery);
    }
}
exports.GoveePlatformAccessory = GoveePlatformAccessory;
//# sourceMappingURL=platformAccessory.js.map