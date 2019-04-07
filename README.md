# FlinBIT

## Connecting a device

Disable ad-block.

Disable Apple Captive (required for some Apple devices):

1. Settings
2. WiFi
3. [You FlinBIT's SSID/name]
4. Little blue `(i)` icon
5. Switch off automatic login

## Talking to your FlinBIT

1. Ensure that you are connected to your FlinBIT's WiFi hotspot and have mobile data turned off and/or ethernet disconnected.
2. Go to http://flinbit.com/ (if this fails, try http://192.168.1.1/ instead)
3. Use the web page to control your FlinBIT

To send a message to your FlinBIT, type the message in the `Serial Message` text box, then press the `Send` button next to it.

Messages beginning with a `/` are commands.

## Data logging

1. Arduino sends raw data to FlinBIT
2. WiFi device (phone/computer/tablet) tells FlinBIT to begin loggin
3. FlinBIT copies all messages from the Arduino to a file
4. Files can be accessed by pressing the `View Logs` button, or going to http://flinbit.com/logs/ (http://192.168.1.1/logs/) while connected to your FlinBIT

Data logger will ignore serial messages beginning with `/`.

Data logger will store all other raw serial data directly into a `.txt` file.

## Data plotting

When you log into your FlinBIT you will have the option to view the incomming data stream in the data plotter.

To hide or show the data plotter, press the `Plotter` button at the top of the page.

To enable or disable the data plotter, tick or untick the `Plot Data` tick box.

To clear all data from the plotter, press the `Clear Plotter` button.

When using the data plotter, the data must be formatted as a comma separated list (eg `1,2,3,4`).

The plotter will count the number of data points in the first message,
all following messages should contain the same number of data points.

Pressing `Clear Plotter` will reset the number of data points.

## Commands

`/set background <JavaScript color>`: changes the background color of the web page (not saved).

`/set foreground <JavaScript color>`: changes the foreground color of the web page (not saved).

`/logstart append <filename>`: Same as pressing the `Start Logging` button with `Overwrite` set. Makes the FlinBIT start logging message to the specified file. If the file already exists, it will be appended to.

`/logstart overwrite <filename>`: Same as pressing the `Start Logging` button with `Overwrite` set. Makes the FlinBIT start logging message to the specified file. If the file already exists, it will be deleted first.

`/logstop`: Same as pressing the `Stop Logging` button. Makes the FlinBIT stop logging message to file.

`/logclear`: Clears all log files off the FlinBIT. !!WARNING: THIS CANNOT BE UNDONE!!

`/plotter show`: Show the data plotter.

`/plotter hide`: Hide the data plotter.

`/plotter toggle`: Toggle the data plotter. Same as pressing the `Plotter` button.

`/plotter clear`: Clear all data from the data plotter.

`/monitor show`: Show the serial monitor.

`/monitor hide`: Hide the serial monitor.

`/monitor toggle`: Toggle the serial monitor. Same as pressing the `Monitor` button.

`/monitor clear`: Clear the serial monitor. Same as pressing the `Clear Monitor` button.

`/monitor set autoscroll [true/false]`: Enable or disable autoscroll in the serial monitor. Same as checking/unchecking the `Autoscroll` check box.

`/logger show`: Hide the logger controlls.

`/logger hide`: Show the logger controlls.

`/logger toggle`: Toggle the logger controlls. Same as pressing the `Logger` button.

`/logger running`: Sent from the FlinBIT to any connected devices to tell them that the FlinBIT is currently logging messages to file.

`/logger notrunning`: Sent from the FlinBIT to any connected devices to tell them that the FlinBIT is *not* currently logging messages to file.

`/islogging`: Ask the FlinBIT if it currently logging message to file. FlinBIT should reply with either `/logger running` or `/logger notrunning`.

# FlinBIT Example



# FlinBITWiFi

FlinBITWiFi is the firmware for the FlinBIT's ESP8266.

The [SPIFFS upload tool](https://github.com/esp8266/arduino-esp8266fs-plugin) is require to upload the website to the ESP8266.

## Building

Rebuilding the SPIFFS data requires GNU Make and gzip (available on most Linux distros).

Simply run `$ make` from the project root directory to rebuild the SPIFFS data from the `FlinBITWiFi/web` directory
