# prop-spaghet-utils
mini propulsion test stand util code

## Running the html GUI

1) cd into the directory where you clone/downloaded this code

2) run `python(3) -m http.server`

(use python or python3 as appropriate for your configuration)

3) go to `http://localhost:8000/pi-value-reader.html` in a browser, ideally in a new window/incognito tab

4) ensure you are connected to the pi, if you are not or the ecs is not running, you will see an error message about websockets.

## Other files

Not needed to ruin the GUI as of now, but useful for testing things locally

sample spaghet json file is the current format of the json we are getting from the test stand. DUMMY DATA json is not the current format, but approximates the LOX test stand format


