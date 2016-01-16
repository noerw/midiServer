# node-midisrv

MIDI websocket client & server, running on node.js

Allows broadcasting of MIDI messages over the network/web.

May also function as a MIDI router on a single machine.

### Installation
Requires `node >=v0.12` and some additional tools for MIDI-IO:

On linux the packages `alsa-base`, `libasound2-dev`, `build-essential`, `python` are required.
Windows and OSX need Python 2.7 & a C++ Compiler.
For more information see [here](https://www.npmjs.com/package/midi#prerequisites).

Once the dependencies are installed, run `npm install`.

### Usage

- display help:

    `node midisrv.js -h`

- list MIDI inputs/outputs. the index is then used for the `-i` and `-o` arguments

    `node midisrv.js -l`

- run the server, which then broadcasts MIDI messages from the selected MIDI input:

    `node midisrv.js -i <midiInputNumber> [-p <portNumber]`

- run the client, which connects to a server instance, and sends the recieved messages to the selected MIDI output:

    `node midisrv.js -o <midiOutputNumber> [-u <serverAddress> -p <portNumber>]`

- route messages on a single machine from one midi device to another:

    `node midisrv.js -i <midiInputNumber> -o <midiOutputNumber> [-p <portNumber>]`
