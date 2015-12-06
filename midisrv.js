"use strict";

var program   = require('commander'),
    midi      = require('midi'),
    WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server;

// Define version/args
program
    .version('0.3')
    .option('-l, --list',       'list MIDI inputs/outputs by index')
    .option('-i, --input <n>',  'MIDI input number  - act as server', parseInt)
    .option('-o, --output <n>', 'MIDI output number - act as client', parseInt)
    .option('-u, --url <s>',    'connection url')
    .option('-p, --port <n>',   'connection port', parseInt)
    .parse(process.argv);

// Initialize MIDI IN/OUT
var input  = new midi.input(),
    output = new midi.output();

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

// if no input nor output is given, display help & exit
if (!program.input && !program.output) {
    console.log("\n  Please specify at least one of the following options:")
    program.outputHelp();
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

// if started with output param, open the MIDI-out port & start websocket client
if (program.output) {
    if (program.output >= 0 && program.output < output.getPortCount()) {
        console.log("MIDI OUT: "+ output.getPortName(program.output));
        output.openPort(program.output);

        createClient(program.url || "localhost", program.port || 1234);
    } else {
        console.log("Invalid output number. Use -l to list them.");
        process.exit(1);
    }
}

function createServer(port) {
    var connectionCount = 0;
    var wss = new WebSocketServer({ port: port }, function(err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }
        console.log("Server Listening on port " + port);
    });

    wss.on('connection', function(ws) {
        connectionCount++;
        console.log("client connected from %s. clients connected: %s",
            ws._socket.remoteAddress, connectionCount);

        ws.on('close', function(code, message) {
            connectionCount--;
            console.log("client disconnected. total clients: %s", connectionCount);
        });

        // Send all MIDI events
        input.on('message', function(deltaTime, message) {
            // only send, if (still) connected
            if (ws.readyState == 1) {
                var msg = {
                    midi: message,
                    deltaTime: deltaTime
                };
                ws.send(JSON.stringify(msg), function(err) {
                    if (err) console.error("could not send message: %s", err);
                });
            }
        });
    });
}

function createClient(url, port) {
    var ws = new WebSocket('ws://' + url + ':' + port),
        lastMsgTimeStamp = new Date().getTime();

    ws.on('error', function(err) {
        console.error('could not connect to server: %s', err);
        process.exit(3);
    });

    ws.on('open', function() {
        console.log("connected to server at %s:%s", url, port);
    });

    ws.on('close', function(code, message) {
        console.error('connection lost.. ' + message);
        process.exit(3);
    });

    ws.on('message', function(data, flags) {
        try {
            var message = JSON.parse(data);
        } catch (e) {
            console.error('could not parse recieved data: %s', e);
        }
        output.sendMessage(message.midi);
        console.log("MIDI event recieved: cmd: %s\t param: %s\t val: %s",
            message.midi[0], message.midi[1], message.midi[2]);
        console.log("relative latency to last event: %s ms",
            getRelativeLatency(message.deltaTime).toFixed(3));
    });

    process.on('SIGINT', function() {
        ws.close(1001, 'client disconnected');
        process.exit(0);
    });

    function getRelativeLatency(deltaTime) {
        var currentTime = new Date().getTime();
        var latency = currentTime - lastMsgTimeStamp - deltaTime * 1000;
        lastMsgTimeStamp = currentTime;
        return latency;
    }
}
