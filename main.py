
import json
import requests
import urllib.parse as urlparse
import re
import csv
import os

from src import tool
from src import data

from flask import Flask, render_template, request, json, jsonify, redirect, url_for

app = Flask(__name__)

#example: /dipam?workflow=WW&?config=CC
@app.route('/')
def index():
    workflow_path = request.args.get('workflow')
    config_path = request.args.get('config')
    if config_path == None:
        config_path = "src/.data/config.json"
    if workflow_path == None:
        workflow_path = "src/.data/workflow.json"

    config_data = json.load(open(config_path))
    workflow_data = json.load(open(workflow_path))

    return render_template('index.html', workflow=workflow_data, config=config_data)


@app.route('/saveworkflow', methods = ['POST'])
def save_workflow():
    jsdata = request.form['workflow_data']
    jsdata = json.loads(jsdata)
    path = request.form['path']
    fname = request.form['name']
    load_after = request.form['load']

    if (path==""):
        path = "static/data/workflow/"

    new_filename = ""
    if fname == "":
        id = 0
        new_filename = "w-"+str(id)
        directory = os.fsencode(path)
        for file in os.listdir(directory):
            filename = os.fsdecode(file)
            if filename == new_filename+".json":
                id = id + 1
                new_filename = "w-"+str(id)
        new_filename = new_filename+".json"
    else:
        new_filename = fname
        if not fname.endswith('.json'):
            new_filename = fname+".json"

    with open(path + new_filename, 'w') as outfile:
        json.dump(jsdata, outfile)

    if load_after == "on":
        return redirect(url_for('index'))
    else:
        return "Save done !"


@app.route('/loadworkflow', methods = ['POST'])
def load_workflow():
    workflow_file = request.form['workflow_file']
    jsdata = json.loads(workflow_file)
    workflow_fname = "workflow.json"
    #we can save it in src/.data/workflow.json
    path = "src/.data/"
    with open(path + workflow_fname, 'w') as outfile:
        json.dump(jsdata, outfile)

    return "Load done !"

@app.route('/process', methods = ['POST'])
def process():

    posted_data = {"id": None, 'type': None, 'value': None, 'name': None, 'input[]': None, 'output[]': None, 'class': None, 'param': {}};
    # MUST: id, type, value, name, input, output
    for k in request.form:
        if(k in posted_data):
            posted_data[k] = request.form[k]
        else:
            # is a PARAM
            posted_data["param"][k] = request.form[k]


    #check if also files have been uploaded
    #this can happen only for 'data' nodes
    for f_k in request.files:
        posted_data["param"][f_k] = request.files[f_k]


    print("Posted data:")
    print(posted_data)

    if posted_data["type"] == "tool":
        a_tool = tool.Tool()
        #a_tool.run(posted_data)
    elif posted_data["type"] == "data":
        a_data = data.Data()
        a_data.index_new_data(posted_data, posted_data["param"])

    return "Processing done !"


if __name__ == '__main__':
    #app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run()
