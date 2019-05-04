
import json
import requests
import urllib.parse as urlparse
import re
import csv
import os

from flask import Flask, render_template, request, json, jsonify

app = Flask(__name__)

#example: /dipam?workflow=WW&?config=CC
@app.route('/')
def index():
    workflow_path = request.args.get('workflow')
    config_path = request.args.get('config')
    if config_path == None:
        config_path = "static/data/config.json"
    if workflow_path == None:
        workflow_path = "static/data/workflow/w0.json"

    config_data = json.load(open(config_path))
    workflow_data = json.load(open(workflow_path))

    return render_template('index.html', workflow=workflow_data, config=config_data)


@app.route('/config')
def showjson():
    jsonpath = request.args.get('path')
    if jsonpath == None:
        jsonpath = "static/data/"

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, jsonpath, "config.json")
    data = json.load(open(json_url))
    return data

if __name__ == '__main__':
    app.run()
