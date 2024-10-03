#!/usr/bin/python
# -*- coding: utf-8 -*-
# Copyright (c) 2024
# Ivan Heibi <ivanhb.ita@gmail.com>
#
# Permission to use, copy, modify, and/or distribute this software for any purpose
# with or without fee is hereby granted, provided that the above copyright notice
# and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
# REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
# FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
# OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
# DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
# ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
# SOFTWARE.

# DIPAM v2
# Ivan Heibi <ivanhb.ita@gmail.com>


# SYS Libraries
import sys
import json
import csv
import os, signal, shutil
import time
import zipfile
import io

# FLASK Libraries
from flask import Flask, render_template, request, json, jsonify, redirect, url_for, send_file, after_this_request

# DIPAM core modules
from app.base.lib.flaskwebgui import FlaskUI
from app.base.core import DIPAM_CONFIG
from app.base.core import DIPAM_RUNTIME
import app.base.util as util

# -----------
# -----------
# -----------

DIPAM_SRC_DIR = "src"


# DIPAM config and global variables
dipam_config = DIPAM_CONFIG(  os.path.join( DIPAM_SRC_DIR, "app","base","config.yaml" )  )

dipam_app_dir = None
dipam_runtime = None
dipam_units = {}


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024    # 500 Mb limit
app.config.update(
    SEND_FILE_MAX_AGE_DEFAULT=True
)
app_flask_main_path = None

@app.route('/')
def _index():
    workflow_path = os.path.join( dipam_app_dir, "runtime","workflow.json" )
    workflow_data = json.dumps(json.load(open(workflow_path)))
    return render_template('index.html', workflow=workflow_data, config={}, port=5000, type="browser")


@app.route('/shutdown', methods=['GET'])
def _shutdown():
    ui.close()
    return 'Server shutting down...'


@app.route('/help/<type>',methods=['GET'])
def _help(type):
    data = {}
    if type == "general":
        data["data"] = dipam_config.get_config_value("description")
        return jsonify(data)

@app.route("/save",methods=['GET'])
def _save():
    return util.zipdir(
        os.path.join( dipam_app_dir, "runtime" ), # source is all runtime directory
        os.path.join( dipam_app_dir, "data", "checkpoint" ) # target is dipam/data/checkpoint
    )

@app.route("/load/<type>",methods = ['POST'])
def _load(type):

    if type == "checkpoint":
        util.copy_dir_to(
            os.path.join( dipam_app_dir,"data","checkpoint","runtime"),
            dir_dipam_app
        )

    elif type == "import":
        if 'runtime' not in request.files:
            return '[ERROR]: No file to load!', 400

        _file = request.files['runtime']
        if _file and _file.filename.endswith('.zip'):

            # check if the uploaded zip is a compatible runtime dipam data
            zip_stream = io.BytesIO(_file.read())
            is_runtime_data, error_msg = dipam_runtime.is_runtime_zip_data(zip_stream)
            zip_stream.seek(0)

            # if its valid runtime data
            if is_runtime_data:
                # delete the current runtime directory and update it with import
                util.delete_path( os.path.join(dipam_app_dir, "runtime") )
                with zipfile.ZipFile(zip_stream, 'r') as zip_ref:
                    zip_ref.extractall( os.path.join(dipam_app_dir, "runtime") )
                zip_stream.seek(0)
            else:
                return error_msg, 400


@app.route("/download/<type>",methods=['GET'])
def _download(type):

    unit_type = type.lower()
    unit_id = False
    if request.args:
        unit_id = request.args.get('id').lower()

    # The file to download is always 1 file (zip if multiple files)
    # The target is the father dir in case of zip
    _f_to_send = None

    if unit_type == "runtime":
        source_dir = os.path.join( dipam_app_dir, "runtime" )

        # > in this case all data in runtime are needed
        if not unit_id:
            dest_dir = os.path.join( dipam_app_dir, "tmp-write" )
            util.clear_directory(dest_dir)
            _f_to_send = util.zipdir(
                source_dir,
                dest_dir
            )

        # > in this case only the runtime workflow is needed
        elif(unit_id == "workflow"):
            _f_to_send = source_dir+"/workflow.json"

        # > in this case only the data of a specific unit is needed
        else:
            source_dir = os.path.join(source_dir,"unit",unit_id)
            dest_dir = os.path.join( dipam_app_dir, "tmp-write" )
            util.clear_directory(dest_dir)
            _f_to_send = util.zipdir(
                source_dir,
                dest_dir
            )

    # edit the path of the file to send considering the realtive path of the falsk app main.py
    _f_to_send = os.path.join(app_flask_main_path , _f_to_send)

    return send_file( _f_to_send, as_attachment=True )

    # except Exception as e:
        # return render_template('error.html', error_msg="[ERROR]: wrong download parameters! – "+str(e), port=5000, type="browser")


@app.route('/runtime/add_unit',methods=['GET'])
def _add_unit():
    """
    [GET-METHOD]
    This call is used to create a new dipam unit: data or tool.
    @params:
        + <type>: the unit type to add: data or tool
        + [<value>]: the specific entity to add; if not specified the first is created.
    """
    unit_type = request.args.get('type').lower()
    unit_id = None
    if request.args.get('value'):
        unit_id = request.args.get('value')

    _unit = dipam_runtime.add_unit(
        unit_type,
        unit_id
    )
    # print(  _unit.backend2view()    ) # PRINT TEST
    return jsonify( _unit.backend2view() )

@app.route('/runtime/delete_unit',methods=['GET'])
def _delete_unit():
    """
    [GET-METHOD]
    This call is used to delete a dipam unit: data or tool.
    @params:
        + <value>: the unit id to delete
    """
    unit_id = None
    if request.args.get('value'):
        unit_id = request.args.get('value')
    dipam_runtime.delete_unit(unit_id)
    return "Unit deleted"

@app.route('/runtime/delete_link',methods=['GET'])
def _delete_link():
    """
    [GET-METHOD]
    This call is used to delete a link between two units
    @params:
        + <source>: the unit id of the source
        + <target>: the unit id of the target
    """
    source_id = request.args.get('source')
    target_id = request.args.get('target')
    if source_id and target_id:
        dipam_runtime.delete_link(
            source_id,
            target_id
        )
        return "Link deleted!", 200
    return "[ERROR]: value(s) not specified", 400


@app.route('/runtime/add_link',methods=['GET'])
def _add_link():
    """
    [GET-METHOD]
    This call is used to create a link between two units in Dipam
    @params:
        + <source>: the unit id of the source
        + <target>: the unit id of the target
    """
    source_id = request.args.get('source')
    target_id = request.args.get('target')
    if source_id and target_id:
        dipam_runtime.add_link(
            source_id,
            target_id
        )
        return "Link done"
    return "[ERROR]: value not specified", 400


@app.route('/runtime/check_compatibility',methods=['GET'])
def _check_compatibility():
    """
    [GET-METHOD]
    This call is used to return all the units that the given unit <value> can be linked to;
    @params:
        + <value>: the specific unit to check
    """
    units = {}

    if request.args.get('value'):
        unit_id = request.args.get('value')

        unit_b_id = None
        if request.args.get('value_to_check'):
            unit_b_id = request.args.get('value_to_check')

        units = dipam_runtime.check_unit_compatibility( unit_id, unit_b_id )
    else:
        return "[ERROR]: value not specified", 400

    return jsonify( units )



if __name__ == '__main__':

    dipam_app_dir = dipam_config.get_config_value("dirs.dipam_app")
    dipam_runtime = DIPAM_RUNTIME(
        # DIPAM CONFIG
        dipam_config,
        # DIPAM UNITS
        {
            "data": dipam_config.get_enabled_units("data"),
            "tool": dipam_config.get_enabled_units("tool")
        }
    )

    dipam_runtime.init_runtime_defaults()


    # Define flask main.py path: this is important to ensure that relative paths of other modules start from the root
    app_flask_main_path = os.path.dirname(os.path.abspath(sys.modules['__main__'].__file__))
    app_flask_main_path = os.path.sep.join(app_flask_main_path.split(os.path.sep)[:-1])

    ui = FlaskUI(app, width=1200, height=800)
    ui.run()
