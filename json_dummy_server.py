from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Replace this with the path to your JSON file
JSON_FILE = "DUMMY_DATA.json"

def read_json_file(file_path):
    with open(file_path, "r") as f:
        import json
        return json.load(f)

@app.route("/")
def serve_json():
    json_data = read_json_file(JSON_FILE)
    return jsonify(json_data)

if __name__ == "__main__":
    app.run(host="localhost", port=9002)
