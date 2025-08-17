from flask import render_template, redirect
import sqlalchemy as sa

from app.models import SpeedShare
from app import app, db

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

@app.route('/share/delete/<string:share_code>')
def share_delete(share_code):
    field = db.session.scalar(
        sa.select(SpeedShare).where(SpeedShare.code == share_code))
    if field is None:
        return redirect('/')

    db.session.delete(field)
    db.session.commit()
    return redirect('/')