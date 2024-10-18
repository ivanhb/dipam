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
from app.base.messenger import DIPAM_MESSENGER
import app.base.util as util

# -----------
# -----------
# -----------

DIPAM_SRC_DIR = "src"



# DIPAM globs: config and runtime
dipam_messenger = DIPAM_MESSENGER()
dipam_config = DIPAM_CONFIG(  os.path.join( DIPAM_SRC_DIR, "app","base","config.yaml" )  )
dipam_app_dir = dipam_config.get_config_value("dirs.dipam_app")

dipam_runtime = DIPAM_RUNTIME(dipam_config)



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

@app.route("/save/<type>",methods=['POST'])
def _save(type):
    if type == "workflow":
        util.mkjson_at(
            os.path.join( dipam_app_dir, "runtime" ),
            "workflow",
            request.get_json()["workflow_data"]
        )

        if "store_checkpoint" in request.get_json():
            if request.get_json()["store_checkpoint"]:
                util.copy_dir_to(
                    os.path.join( dipam_app_dir, "runtime" ),
                    os.path.join( dipam_app_dir, "data", "checkpoint" )
                )
                
        return dipam_messenger.build_view_msg(code=200)
    return dipam_messenger.build_view_msg(code=304)

@app.route("/load/<type>",methods = ['POST'])
def _load(type):

    if type == "checkpoint":
        util.copy_dir_to(
            os.path.join( dipam_app_dir,"data","checkpoint","runtime"),
            dipam_app_dir
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
            _f_to_send = os.path.join( source_dir, "workflow.json")

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

@app.route('/runtime/all_unit',methods=['GET'])
def _all_units():
    """
    [GET-METHOD]
    This call is used to get the list of all available unit classes for a specific <type>
    @params:
        + <type>: the unit type
    """
    unit_type = request.args.get('type').lower()
    unit_classes = dipam_config.get_enabled_units(unit_type)
    res = []
    for _c in unit_classes:
        _unit = util.create_instance(
            unit_classes[_c]["model_fpath"],
            _c
        )
        res.append(_unit.dump_attributes())
        del _unit
    return jsonify( res )


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
    unit_class = None
    if request.args.get('class'):
        unit_class = request.args.get('class')

    _unit = dipam_runtime.add_unit(
        unit_type,
        unit_class = unit_class
    )

    return jsonify( {
        "id": _unit.id,
        "type":_unit.type,
        "class":_unit.unit_class
    } )

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


@app.route("/runtime/save_unit",methods = ['POST'])
def _save_runtime_unit():
    res = None
    data = request.get_json()
    if data:
        unit_id = data.get('unit_id')
        unit_type = data.get('unit_type')
        unit_class = data.get('unit_class')
        unit_data = data.get('data')
        if unit_data:
            print("Saving the data",unit_data," – of: ", unit_id)

            # Save unit data, and specifiy source_is_view to True
            # This also saves/updates the runtime index metadata
            res_save  = dipam_runtime.save_unit_data(unit_data, unit_id, True)
            if isinstance(res_save, tuple):
                return dipam_messenger.build_view_msg(res_save)

            new_value = res_save[0]
            storage_dir = res_save[1]

            # Save the status of the runtime
            dipam_runtime.save_runtime_status(storage_dir)

    return dipam_messenger.build_view_msg(new_value)


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


@app.route('/runtime/get_template',methods=['GET'])
def _get_template():
    """
    [GET-METHOD]
    This API call is used to return the path to the HTML file that defines the base and specific template of unit;
    unit with type=<type> and class=<class>
    @params:
        + <type>: the unit type (tool or data)
        + <class>: the unit class
        + <id>: the unit id
    """
    res = {}
    unit_id = request.args.get('id')
    html_content, script_content = dipam_runtime.build_view_template(unit_id)
    if unit_id:
        res = {
            "html_content": html_content,
            "script_content": script_content
        }
    return jsonify( res )


if __name__ == '__main__':


    # Define flask main.py path: this is important to ensure that relative paths of other modules start from the root
    app_flask_main_path = os.path.dirname(os.path.abspath(sys.modules['__main__'].__file__))
    app_flask_main_path = os.path.sep.join(app_flask_main_path.split(os.path.sep)[:-1])

    # Load last workflow saved in checkpoint
    _load("checkpoint")

    ui = FlaskUI(app, width=1400, height=800)
    ui.run()
