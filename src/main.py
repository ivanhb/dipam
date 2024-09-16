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

# FLASK Libraries
from flask import Flask, render_template, request, json, jsonify, redirect, url_for, send_file, after_this_request

# DIPAM core modules
from app.lib.flaskwebgui import FlaskUI
from app.base.core import DIPAM_CONFIG
from app.base.core import DIPAM_RUNTIME
import app.base.util as util

# -----------
# -----------
# -----------

DIPAM_APP_DIR = "./dipam"
DIPAM_SRC_DIR = "./src"


# DIPAM config and global variables
dipam_config = DIPAM_CONFIG(  DIPAM_SRC_DIR+"/app/base/config.yaml"  )
dipam_runtime = None
dipam_units = {}


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024    # 500 Mb limit
app.config.update(
    SEND_FILE_MAX_AGE_DEFAULT=True
)

@app.route('/')
def index():
    workflow_path = DIPAM_APP_DIR+"/runtime/workflow.json"
    workflow_data = json.dumps(json.load(open(workflow_path)))
    return render_template('index.html', workflow=workflow_data, config={}, port=5000, type="browser")

@app.route('/api/new_data_unit/<class_name>')
def new_data_unit(class_name):
    _d = dipam_runtime.create_new_data(class_name)
    print(_d.id)

if __name__ == '__main__':


    dipam_runtime = DIPAM_RUNTIME(

        # DIPAM CONFIG
        dipam_config,

        # DIPAM UNITS
        {
            "data": dipam_config.get_enabled_data_units(),
            #"tool": dipam_config.get_enabled_tool_units(),
            #"param": dipam_config.get_enabled_param_units()
        }
    )

    # to create an instance
    #print( util.create_instance("src/app/data/enabled/d_table.py","D_CSV" ) )

    ui = FlaskUI(app, width=1200, height=800)
    ui.run()
