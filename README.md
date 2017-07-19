Con Fusion App
=====================

### With the Ionic tool:

Install Ionic and Cordova:

```bash
$ sudo npm install -g ionic cordova
```

Then, debug your application.
A web page will popup on http://localhost:8100

```bash
$ ionic serve lab
```

To test on a device, add needed platform:

```bash
$ ionic platform add ios
```

Substitute ios for android if not on a Mac.

Then to run the application on your device, run the command:

```bash
$ ionic cordova run ios
```

If you have the device plugged in, it will run on the device.
Otherwise, it will start the device's emulator.

Workaround:
In case of "Error: Cannot read property 'replace' of undefined"

```bash
$ cd platforms/ios/cordova/ && npm install ios-sim
```
