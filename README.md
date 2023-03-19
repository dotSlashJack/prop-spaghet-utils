# prop-spaghet-utils
mini propulsion test stand util code

## Running the html GUI

1) cd into the directory where you clone/downloaded this code

2) run `python(3) -m http.server`

(use python or python3 as appropriate for your configuration)

3) go to `http://localhost:8000/pi-value-reader.html` in a browser, ideally in a new window/incognito tab

4) ensure you are connected to the pi, if you are not or the ecs is not running, you will see an error message about websockets.

## Adding more tests and states

To add more states and batches for future tests, update the `STATE_SETS.json` file, following the existing format. The web GUI will automatically populate the dropdowns from this information after restarting the page.

## Websocket Sim

If you wish to simulate JSON that would come in from the pi locally, run the `json_dummy_server.py` file and update the socket address (set to `const socket = new WebSocket('ws://localhost:9002/ws');`) in the `script.js` file accordingly. You can also edit the sample json file or add your own to change which values come in.
