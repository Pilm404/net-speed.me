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
    field = db.session.scalar(
        sa.select(SpeedShare).where(SpeedShare.code == share_code))
    if field is None:
        return render_template('error.html', error_code=404), 404

    dp = min((field.download_speed or 0) / 100 * 100, 100)
    up = min((field.upload_speed or 0) / 100 * 100, 100)
    pp = min((field.ping or 0) / 100 * 100, 100)

    return render_template('share.html', uuid=share_code, download=field.download_speed, upload=field.upload_speed,
                            ping=field.ping, download_progress=dp, upload_progress=up, ping_progress=pp)

@app.route('/share/delete/<string:share_code>')
def share_delete(share_code):
    field = db.session.scalar(
        sa.select(SpeedShare).where(SpeedShare.code == share_code))
    if field is None:
        return redirect('/')

    db.session.delete(field)
    db.session.commit()
    return redirect('/')