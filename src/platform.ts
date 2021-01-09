import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { GoveePlatformAccessory } from "./platformAccessory";

import {
  startDiscovery,
  debug as GoveeDebug,
  GoveeReading,
} from "govee-bt-client";
import { DeviceContext } from "./deviceContext";

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class GoveeHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.info("Finished initializing platform:", this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback");
      // run the method to discover / register your devices as accessories

      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    this.log.debug("Start discovery");

    if (this.config.debug) {
      GoveeDebug(true);
    }

    const discoveryCache = new Map();

    startDiscovery((reading: GoveeReading) => {
      this.log.debug("Govee reading", reading);

      let deviceUniqueId = reading.uuid;
      if (reading.model !== "") {
        deviceUniqueId = reading.model;
      }

      // discovered devices and register each one if it has not already been registered

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(deviceUniqueId);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid
      );

      if (discoveryCache.has(uuid)) {
        const cachedInstance = discoveryCache.get(
          uuid
        ) as GoveePlatformAccessory;
        cachedInstance.updateReading(reading);
        return;
      }

      if (existingAccessory) {
        // the accessory already exists
        this.log.info(
          "Restoring existing accessory from cache:",
          existingAccessory.displayName
        );

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.context.batteryThreshold = this.config.batteryThreshold;
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        const existingInstance = new GoveePlatformAccessory(
          this,
          existingAccessory,
          reading
        );

        discoveryCache.set(uuid, existingInstance);
      } else {
        const displayName = `${this.sanitize(reading.model)}`;

        // the accessory does not yet exist, so we need to create it
        this.log.info("Adding new accessory:", displayName);

        // create a new accessory
        const accessory = new this.api.platformAccessory(displayName, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        const contextDevice: DeviceContext = {
          address: this.sanitize(reading.address),
          model: this.sanitize(reading.model),
          uuid: reading.uuid,
        };
        accessory.context.device = contextDevice;
        accessory.context.batteryThreshold = this.config.batteryThreshold;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        const newInstance = new GoveePlatformAccessory(
          this,
          accessory,
          reading
        );

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);

        discoveryCache.set(uuid, newInstance);
      }
    });

    // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
    // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }

  private sanitize(s: string): string {
    return s.trim().replace("_", "");
  }
}
