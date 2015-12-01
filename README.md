midiServer
==========

MIDI websocket nodeJS server.

Installation
------------

Requires `node >v0.10` and some additional tools for MIDI-IO:

On linux ALSA, `libasound2-dev` and `build-essential` are required.
For more information on other platforms see [here](https://www.npmjs.com/package/midi#prerequisites).

To install, run `npm install` once.

Running
-------

- To display help:

    `node midiServer.js -h`

- To list MIDI inputs/outputs:

    `node <midiServer.js> -l`

- To select inputs/outputs:

    `node midiServer.js -i <midiInputNumber> -o <midiOutputNumber>`

- To choose a different listening port (defaults to `1337`):

    `node midiServer.js -p <portNumber>`

Websocket message syntax
------------------------

`[ eventType, note, velocity ]`


    eventType: 144 = note On
               128 = note Off
               176 = CC message
