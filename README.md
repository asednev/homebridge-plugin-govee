
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# homebridge-plugin-govee

Govee H5075 Thermometer Hygrometer plugin for Homebrige. Exposes current humidity, current temperate, and low battery mode.

<img src="https://github.com/asednev/homebridge-plugin-govee/raw/master/assets/GoveeH5075.jpg" alt="Govee H5075">

## Supported Devices

* Govee H5075

## Prerequisites

* Compatible bluetooth module for macOS / Windows / Linux (see [prerequisites for noble](https://github.com/abandonware/noble#prerequisites)).
* [Homebridge](https://github.com/homebridge/homebridge/)
* node v12+

## Getting Started

This plugin is plug-and-play, it will identify Govee devices broadcasting their readings within the range over Bluetooth Low Energy. No configuration is necessary. If your sensors don't show up within 2-3 minutes, check troubleshooting steps and homebridge logs.

## Troubleshooting

* Check `[x] Debug` in Homebridge settings for Govee Homebridge Plugin
* Enable `Homebridge Debug Mode` in Homebridge Settings

## Credits

* [Homebridge](https://github.com/homebridge/homebridge/) for a great platform to build on top of.
* [Thrilleratplay/GoveeWatcher](https://github.com/Thrilleratplay/GoveeWatcher) for explanation and examples of how to decode advertisement data for Govee G5075.
* [@abandonware/noble](https://github.com/abandonware/noble) for a great BLE library for node
