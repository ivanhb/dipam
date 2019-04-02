
from flask import Flask
from flask import render_template
app = Flask(__name__)

#@app.route('/')
@app.route('/vwbata')
@app.route('/vwbata?workflow=<workflow>')
def hello(workflow=None):
    return render_template('index.html', workflow=workflow)
