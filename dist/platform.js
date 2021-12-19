"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoveeHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const platformAccessory_1 = require("./platformAccessory");
const govee_bt_client_1 = require("govee-bt-client");
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class GoveeHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap
            .Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.discoveryCache = new Map();
        this.log.info("Finished initializing platform:", this.config.name);
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on("didFinishLaunching", () => {
            log.debug("Executed didFinishLaunching callback");
            // run the method to discover / register your devices as accessories
            this.platformStatus = "didFinishLaunching" /* DID_FINISH_LAUNCHING */;
            this.discoverDevices();
        });
        this.api.on("shutdown", () => {
            this.platformStatus = "shutdown" /* SHUTDOWN */;
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
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
            (0, govee_bt_client_1.debug)(true);
        }
        (0, govee_bt_client_1.startDiscovery)(this.goveeDiscoveredReading.bind(this));
        (0, govee_bt_client_1.registerScanStart)(this.goveeScanStarted.bind(this));
        (0, govee_bt_client_1.registerScanStop)(this.goveeScanStopped.bind(this));
        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    goveeDiscoveredReading(reading) {
        this.log.debug("Govee reading", reading);
        let deviceUniqueId = reading.uuid;
        if (reading.model) {
            deviceUniqueId = reading.model;
        }
        if (!deviceUniqueId) {
            this.log.error("device missing unique identifier. Govee reading: ", reading);
            return;
        }
        // discovered devices and register each one if it has not already been registered
        // generate a unique id for the accessory this should be generated from
        // something globally unique, but constant, for example, the device serial
        // number or MAC address
        const uuid = this.api.hap.uuid.generate(deviceUniqueId);
        // see if an accessory with the same uuid has already been registered and restored from
        // the cached devices we stored in the `configureAccessory` method above
        const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);
        if (this.discoveryCache.has(uuid)) {
            const cachedInstance = this.discoveryCache.get(uuid);
            cachedInstance.updateReading(reading);
            return;
        }
        if (existingAccessory) {
            // the accessory already exists
            this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName);
            // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
            existingAccessory.context.batteryThreshold = this.config.batteryThreshold;
            existingAccessory.context.humidityOffset = this.config.humidityOffset;
            this.api.updatePlatformAccessories([existingAccessory]);
            // create the accessory handler for the restored accessory
            // this is imported from `platformAccessory.ts`
            const existingInstance = new platformAccessory_1.GoveePlatformAccessory(this, existingAccessory, reading);
            this.discoveryCache.set(uuid, existingInstance);
        }
        else {
            const displayName = `${this.sanitize(reading.model)}`;
            // the accessory does not yet exist, so we need to create it
            this.log.info("Adding new accessory:", displayName);
            // create a new accessory
            const accessory = new this.api.platformAccessory(displayName, uuid);
            // store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the accessory you may need
            const contextDevice = {
                address: this.sanitize(reading.address),
                model: this.sanitize(reading.model),
                uuid: reading.uuid,
            };
            accessory.context.device = contextDevice;
            accessory.context.batteryThreshold = this.config.batteryThreshold;
            accessory.context.humidityOffset = this.config.humidityOffset;
            // create the accessory handler for the newly create accessory
            // this is imported from `platformAccessory.ts`
            const newInstance = new platformAccessory_1.GoveePlatformAccessory(this, accessory, reading);
            // link the accessory to your platform
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                accessory,
            ]);
            this.discoveryCache.set(uuid, newInstance);
        }
    }
    goveeScanStarted() {
        this.log.info("Govee Scan Started");
    }
    goveeScanStopped() {
        this.log.info("Govee Scan Stopped");
        if (!this.platformStatus || this.platformStatus === "shutdown" /* SHUTDOWN */) {
            return;
        }
        const WAIT_INTERVAL = 5000;
        // wait, and restart discovery if platform status doesn't change
        setTimeout(() => {
            if (!this.platformStatus || this.platformStatus === "shutdown" /* SHUTDOWN */) {
                return;
            }
            this.log.warn("Govee discovery stopped while Homebridge is running.");
            this.log.info("Restart Discovery");
            (0, govee_bt_client_1.startDiscovery)(this.goveeDiscoveredReading.bind(this));
        }, WAIT_INTERVAL);
    }
    sanitize(s) {
        return s.trim().replace("_", "");
    }
}
exports.GoveeHomebridgePlatform = GoveeHomebridgePlatform;
//# sourceMappingURL=platform.js.map