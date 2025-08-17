from flask import render_template, jsonify, request, Response
from app import app

@app.route('/')
@app.route('/index')
def index():
    return render_template('speedtest.html')

@app.route('/about_me')
def about_me():
    return render_template('user_info.html')

@app.route('/share/<string:share_code>')
def share(share_code):
    return render_template('share.html')