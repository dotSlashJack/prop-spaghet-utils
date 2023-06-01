# prop-spaghet-utils
mini propulsion test stand util code

## Running the html GUI

1) cd into the directory where you clone/downloaded this code

e.g., `cd /Users/jack/Github/prop-spaghet-utiils`

2) once inside, run `python(3) -m http.server`

(use python or python3 as appropriate for your configuration)

3) go to `http://localhost:8000/pi-value-reader.html` in a browser, ideally in a new window/incognito tab (if you do not, you run the risk of your browser showing a cached version of the page which can cause issues)

4) ensure you are connected to the pi, if you are not or the ecs is not running, you will see an error message about websockets.

NB: if you want to test with a different pi, open `script.js` inside resources, and change which device you are connecting to by editing/commenting out the lines at the top. For example, if you want to connect to `raspberrypi.local` make sure the line 

`const socket = new WebSocket('ws://raspberrypi.local:9002/ws');`

is active (no `//` before it), and all other socket lines are commented out (have the `//` in front of them)


## Running the logger

1) make sure tkinter is installed

2) open the window by running `python(3) ecs_logger.py`

3) choose a save directory for the logs, make sure you're connected to the pi (or sim) and update the address accordingly

4) click `start logging` to begin, and make sure the number of json reports increases if you are expecting data; the csv should also show up immediately and will be timestamped with epoch time

5) click `stop logging` when done

NB: To split the file mid-run (for analysis, etc.) click the split new file button. This will break off a new log csv file starting at the time of the click, and stop logging to the original file

## Adding more tests and states

To add more states and batches for future tests, update the `STATE_SETS.json` file, following the existing format. The web GUI will automatically populate the dropdowns from this information after restarting the page.

## Adding more valves

For valves, edit `VALVE_NAMES.json`. Keep in mind that the `type` determines where in the GUI the valve will show. Right now, it's set up to have an oxidizer (light blue) section and a fuel (light red) section. Type tells the javascript code where to put each valve.

## Adding more sequences

Add a sequence name to `SEQUENCE_NAMES.json`, making sure it matches the exact string name of the sequence in the ecs software itself.

## Websocket Sim

If you wish to simulate JSON that would come in from the pi locally, run the `json_dummy_server.py` file and update the socket address (set to `const socket = new WebSocket('ws://localhost:9002/ws');`) in the `script.js` file accordingly. You can also edit the sample json file or add your own to change which values come in.
