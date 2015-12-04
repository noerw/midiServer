midiServer
==========

MIDI websocket client & server, running on node.js
Allows broadcasting of MIDI messages over the network/web.
May also function as a MIDI router on a single machine.

Installation
------------

Requires `node >v0.10` and some additional tools for MIDI-IO:

On linux ALSA, `libasound2-dev` and `build-essential` are required.
For more information on other platforms see [here](https://www.npmjs.com/package/midi#prerequisites).

Once the dependencies are installed, run `npm install`.

Usage
-------

- display help:

    `node midiServer.js -h`

- list MIDI inputs/outputs. the indizes are used then for the `-i` and `-o` arguments.

    `node midiServer.js -l`

- run the server, which then broadcasts MIDI messages from the selected MIDI input:

    `node midiServer.js -i <midiInputNumber> [-p <portNumber]`

- run the client, which connects to a server instance, and sends the recieved messages to the selected MIDI output:

    `node midiServer.js -o <midiOutputNumber> [-u <serverAddress> -p <portNumber>]`

- route messages on a single machine from one midi device to another:

    `node midiServer.js -i <midiInputNumber> -o <midiOutputNumber> [-p <portNumber>]`
