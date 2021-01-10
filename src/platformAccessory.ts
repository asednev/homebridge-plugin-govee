import { Service, PlatformAccessory, CharacteristicGetCallback } from 'homebridge';

import { GoveeHomebridgePlatform } from './platform';
import { GoveeReading } from 'govee-bt-client';
import { DeviceContext } from './deviceContext';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GoveePlatformAccessory {

  private LOW_BATTERY_THRESHOLD = 25;
  private HUMIDITY_OFFSET = 0;

  private humiditySensor: Service;
  private temperatureSensor: Service;
  private lastReading: GoveeReading;

  constructor(
    private readonly platform: GoveeHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly reading: GoveeReading,
  ) {
    this.lastReading = reading;

    if (!accessory.context.device) {
      throw new Error('Missing device context');
    }

    const deviceContext: DeviceContext = accessory.context.device;
    
    if (accessory.context.batteryThreshold) {
      this.LOW_BATTERY_THRESHOLD = accessory.context.batteryThreshold;
    }
    if (accessory.context.humidityOffset) {
      this.HUMIDITY_OFFSET = accessory.context.humidityOffset;
    }
    // set accessory information
    const accessoryInformationService = this.accessory.getService(this.platform.Service.AccessoryInformation);

    accessoryInformationService?.setCharacteristic(this.platform.Characteristic.Manufacturer, 'Govee')
      .setCharacteristic(this.platform.Characteristic.Model, deviceContext.model);

    if (deviceContext.address && deviceContext.address !== '') {
      accessoryInformationService?.setCharacteristic(this.platform.Characteristic.SerialNumber, deviceContext.address);
    }

    // get the HumiditySensor service if it exists, otherwise create a new HumiditySensor service
    // you can create multiple services for each accessory
    this.humiditySensor = this.accessory.getService(this.platform.Service.HumiditySensor)
      || this.accessory.addService(this.platform.Service.HumiditySensor);
    this.humiditySensor.setCharacteristic(this.platform.Characteristic.Name, deviceContext.model);
    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    this.humiditySensor.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on('get', this.getCurrentRelativeHumidity.bind(this));
    this.humiditySensor.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .on('get', this.getStatusLowBattery.bind(this));

    this.temperatureSensor = this.accessory.getService(this.platform.Service.TemperatureSensor)
      || this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.temperatureSensor.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.getCurrentTemperature.bind(this));
    this.temperatureSensor.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .on('get', this.getStatusLowBattery.bind(this));

  }

  getCurrentRelativeHumidity(callback: CharacteristicGetCallback) {
    this.platform.log.debug('getCurrentRelativeHumidity', this.lastReading?.humidity, "offset", this.HUMIDITY_OFFSET);
    callback(null, this.lastReading?.humidity + this.HUMIDITY_OFFSET);
  }

  getStatusLowBattery(callback: CharacteristicGetCallback) {
    this.platform.log.debug('getStatusLowBattery');
    callback(null, this.lastReading?.battery <= this.LOW_BATTERY_THRESHOLD);
  }

  getCurrentTemperature(callback: CharacteristicGetCallback) {
    this.platform.log.debug('getCurrentTemperature', this.lastReading?.tempInC);
    callback(null, this.lastReading?.tempInC);
  }

  updateReading(reading: GoveeReading) {
    this.lastReading = reading;

    this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity + this.HUMIDITY_OFFSET);
    this.temperatureSensor.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.tempInC);
  }

}
