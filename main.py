
import json
import requests
import re
import csv
import os
from os.path import basename
import zipfile

from src import tool
from src import data
from src import linker

from flask import Flask, render_template, request, json, jsonify, redirect, url_for, send_file

app = Flask(__name__)

BASE_PATH = "src/.process-temp"
dipam_linker = linker.Linker()
dipam_tool = tool.Tool()
dipam_data = data.Data()
#Will store all the FileStorage of the 'data' nodes
corpus = {}
CONFIG_PATH = "src/.data/config.json"
CONFIG_DATA = {}

#example: /dipam?workflow=WW&?config=CC
@app.route('/')
def index():
    workflow_path = request.args.get('workflow')
    #config_path = request.args.get('config')
    #if config_path == None:
    #    config_path = "src/.data/config.json"
    if workflow_path == None:
        workflow_path = "src/.data/workflow.json"

    #config_data = json.load(open(config_path))
    workflow_data = json.load(open(workflow_path))

    #dipam_data.set_data_index(config_data["data"])

    return render_template('index.html', workflow=workflow_data, config=CONFIG_DATA)

@app.route("/download/<id>")
def download(id):

    def zipdir(path, ziph):
        # ziph is zipfile handle
        for root, dirs, files in os.walk(path):
            for file in files:
                abs_path = os.path.join(root, file)
                if not abs_path.endswith(".zip"):
                    ziph.write(abs_path,basename(abs_path))

    try:
        if(id == "workflow"):
            return send_file("src/.data/workflow.json", as_attachment=True)
        else:
            a_zip_dir = "src/.process-temp/"+id+"/"
            zipf = zipfile.ZipFile(a_zip_dir+"/"+id+".zip", 'w', zipfile.ZIP_DEFLATED)
            zipdir(a_zip_dir, zipf)
            zipf.close()

            return send_file(a_zip_dir+"/"+id+".zip", as_attachment=True)
    except Exception as e:
        return e

@app.route('/saveworkflow', methods = ['POST'])
def save_workflow():
    jsdata = request.form['workflow_data']
    jsdata = json.loads(jsdata)
    path = request.form['path']
    fname = "workflow.json"
    load_after = request.form['load']

    if (path==""):
        path = "src/.data/"

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
    posted_data = {
                "id": None,
                'type': None,
                'value': None,
                'name': None,
                'input[]': None,
                'output[]': None,
                'compatible_input[]': None,
                'class': None,
                #the above are must attributes
                'param': {}
    };

    def write_file(path, file_value):
        with open(path, 'w') as d_file:
            d_file.write(file_value)
        return path

    #########
    # Populate the 'posted_data' variable
    #########
    for k in request.form:
        #files are treated later
        if not k.startswith('p-file'):

            val = request.form[k]
            if k.endswith('[]'):
                val = []
                val = request.form.getlist(k)

            if(k in posted_data):
                posted_data[k] = val
            else:
                # is a PARAM
                posted_data["param"][k] = val


    #check if also files have been uploaded
    #this can happen only for 'data' nodes
    for f_k in request.files:
        posted_data["param"][f_k] = request.files.getlist(f_k)


    #########
    # Process the <posted_data>
    #
    # If is a Tool:
    #   check all the input nodes
    #   take only the compatible data from all the nodes
    #########
    elem_id = posted_data["id"]
    elem_value = posted_data["value"]
    elem_class = posted_data["class"]
    elem_index = None
    data_entries = []

    if posted_data["type"] == "tool":

        input_files = {}
        for comp_input in posted_data["compatible_input[]"]:
            input_files[comp_input] = []

        for id_input in posted_data['input[]']:

            #is a data file -> Take it from the corpus (Its data is suitable, DIPAM does this on ClientSide)
            if id_input in corpus:
                d_value = next(iter(corpus[id_input].items()))[0]
                if d_value in input_files:
                    input_files[d_value].extend(corpus[id_input][d_value]["files"])

            #is a tool input -> check the outputs compatible with my inputs
            else:
                #ask the linker for its link object
                index_elem = dipam_linker.get_elem(id_input)

                if index_elem != -1:
                    #check if the input node have compatible data i can take
                    set_of_files = {}
                    for comp_input in input_files:
                        if comp_input in index_elem:
                            index_elem_data = index_elem[comp_input]
                            #call the data handler to process this type of inputs
                            for file_k in index_elem_data:
                                file_path = BASE_PATH+"/"+str(id_input)+"/"+str(file_k)
                                input_files[comp_input].extend(dipam_data.handle([file_path], comp_input, file_path = True))

        #The data entries in this case are the output of the tool
        data_entries = dipam_tool.run(posted_data, input_files, posted_data["param"])

        #check if there were errors
        if len(data_entries) > 0:
            print(data_entries[0])
            if "error" in data_entries[0]:
                an_error = data_entries[0]["error"]
                k_error = next(iter(an_error))
                return "Error: "+an_error[k_error]

        #Index the new Tool and its output data
        elem_index = dipam_linker.index_elem(posted_data["id"])
        if elem_index != None:
            for d_entry in data_entries:
                #<d_entry> e.g: {'d-gen-text': {'files': ['1.txt', '2.txt']}}
                dipam_linker.add_entry(posted_data["id"], d_entry)
                #write entries in dir
                if len(d_entry.keys()) > 0:
                    entry_item = next(iter(d_entry.items()))[0]
                    for a_doc_key in d_entry[entry_item]:
                        #write according to the type of file
                        write_file(BASE_PATH+"/"+str(elem_id)+"/"+str(a_doc_key), d_entry[entry_item][a_doc_key])


    elif posted_data["type"] == "data":
        #data_entries.append(dipam_linker.build_data_entry(posted_data))
        #The data entries in this case are the elements themselfs
        # we read directly these files and save them locally
        #add the corresponding files
        files = None;
        if 'p-file[]' in posted_data["param"]:
            files = posted_data["param"]['p-file[]']

        corpus[elem_id] = {}
        corpus[elem_id][elem_value] = {}
        corpus[elem_id][elem_value]["files"] = dipam_data.handle(files, elem_value)

    #print(posted_data["id"]," index is: " ,dipam_linker.get_elem(posted_data["id"]))9
    return "Success:Processing done !"

if __name__ == '__main__':
    #app.config['TEMPLATES_AUTO_RELOAD'] = True
    CONFIG_DATA = json.load(open(CONFIG_PATH))
    dipam_data.set_data_index(CONFIG_DATA["data"])

    app.run()
