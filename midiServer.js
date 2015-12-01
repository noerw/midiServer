//--------------------------------------------------------------------------------
// midiServer - MIDI websocket nodeJS server.
// Copyright (C) 2013  Paul Sébastien
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//--------------------------------------------------------------------------------

"use strict";

var program   = require('commander'),
    midi      = require('midi'),
    websocket = require('websocket'),
    http      = require('http');

// Define version/args
program
    .version('0.2')
    .option('-l, --list',       'list MIDI inputs/outputs by number')
    .option('-i, --input <n>',  'MIDI input number', parseInt)
    .option('-o, --output <n>', 'MIDI output number', parseInt)
    .option('-p, --port <n>',   'server listening port', parseInt)
    .parse(process.argv);

// Initialize MIDI IN/OUT
var input  = new midi.input(),
    output = new midi.output();

// Websocket variables
var connection,
    port = 1337;

// Server listening port
if (program.port) {
    port = program.port;
}
console.log("Server Listening on port " + port);

// List MIDI ports
if (program.list) {
    console.log("MIDI IN ports:");
    for (var p = 0; p < input.getPortCount(); p++) {
        console.log(p + " -", input.getPortName(p));
    }
    console.log("MIDI OUT ports:");
    for (var p = 0; p < output.getPortCount(); p++) {
        console.log(p + " -", output.getPortName(p));
    }
    process.exit(0);
}

// Select MIDI IN
if (program.input) {
    if (program.input >= 0 && program.input < input.getPortCount()) {
        console.log("MIDI IN: " + input.getPortName(program.input));
        input.openPort(program.input);
    } else {
        console.log("Wrong input number. Use argument -l to list them.");
        process.exit(1);
    }
}

// Select MIDI OUT
if (program.output) {
    if (program.output >= 0 && program.output < output.getPortCount()) {
        console.log("MIDI OUT: "+ output.getPortName(program.output));
        output.openPort(program.output);
    } else {
        console.log("Wrong output number. Use argument -l to list them.");
        process.exit(1);
    }
}

// Websocket
var server = http.createServer(function(request, response) {});
server.listen(port, function() { });

// Server creation
var wsServer = new websocket.server({ httpServer: server });

// WS server
wsServer.on('request', function(request) {
    connection = request.accept(null, request.origin);
    console.log("Connection request");

    // Received MIDI event
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            output.sendMessage(JSON.parse(message.utf8Data));
        }
    });

    connection.on('close', function(connection) {
        console.log("Connection lost");
    });
});

// Send MIDI event
input.on('message', function(deltaTime, message) {
    if (connection !== undefined) {
         connection.sendUTF(JSON.stringify(message));
    }
});
