#! /usr/bin/env node

'use strict';

var program   = require('commander'),
    midi      = require('midi'),
    WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server;

// Define version/args
program
    .version('0.4.0')
    .option('-i, --input <n>',  'MIDI input number  - act as server', parseInt)
    .parse(process.argv);

// Initialize MIDI IN/OUT
var input  = new midi.input(), output = new midi.output();

// List MIDI ports
if (!program.input) {
    program.outputHelp();

    console.log("\n  MIDI IN ports:\n");
    for (var p = 0; p < input.getPortCount(); p++) {
        console.log(p + " -", input.getPortName(p));
    }
    console.log("\n  MIDI OUT ports:\n");
    for (var p = 0; p < output.getPortCount(); p++) {
        console.log(p + " -", output.getPortName(p));
    }
    process.exit(0);
}

// if started with input param, open the MIDI-in port & start websocket server
if (program.input) {
    if (program.input >= 0 && program.input < input.getPortCount()) {
        console.log("MIDI IN: " + input.getPortName(program.input));
        input.openPort(program.input);
        // don't ignore any signals. (types are: sysex, clock, active sensing)
        input.ignoreTypes(false, false, false);

        createServer(program.port || 1234);
    } else {
        console.log("Invalid input number. Use -l to list them.");
        process.exit(1);
    }
}

function createServer(port) {
      input.on('message', function(deltaTime, message) {
          var msg = {
              midi: message,
              deltaTime: deltaTime
          };
          console.log(msg);
      });
}

