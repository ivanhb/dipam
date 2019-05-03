
import json
import requests
import urllib.parse as urlparse
import re
import csv
from flask import Flask, render_template
app = Flask(__name__)


@app.route('/')
@app.route('/dipam')
@app.route('/dipam?workflow=<workflow>?config=<config>')
def index(workflow=None, config=None):
    return render_template('index.html', workflow=workflow, config=config)

if __name__ == '__main__':
    app.run()
