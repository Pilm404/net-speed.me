from flask import render_template
from app import app

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', error_code=404), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('error.html', error_code=500), 500

@app.errorhandler(403)
def forbidden(e):
    return render_template('error.html', error_code=403), 403