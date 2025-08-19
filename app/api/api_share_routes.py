from datetime import datetime, timedelta, timezone
from flask import jsonify, request
import sqlalchemy as sa

from app.models import SpeedShare
from app.util import get_safe_uuid
from app import app, db


@app.route('/api/share/<string:share_code>')
def get_share_data(share_code):
    data = db.session.scalar(
        sa.select(SpeedShare).where(SpeedShare.code == share_code))
    if data is None:
        return "", 404

    return jsonify({'download': data.download_speed, 'upload': data.upload_speed, 'ping': data.ping})

@app.route('/api/share/add/', methods=['POST'])
def add_share():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': "Can not get data from JSON"}), 400

        pair = db.session.scalar(
            sa.select(SpeedShare).where(SpeedShare.download_speed == data.get('download') and
                                        SpeedShare.upload_speed == data.get('upload') and
                                        SpeedShare.ping == data.get('ping') and
                                        SpeedShare.ip == request.remote_addr))

        if pair:
            return jsonify({'success': True, 'code': pair.code}), 201

        two_days_ago = datetime.now(timezone.utc) - timedelta(days=1)
        recent_records_count = db.session.scalar(
            sa.select(sa.func.count(SpeedShare.id)).where(
                sa.and_(
                    SpeedShare.ip == request.remote_addr,
                    SpeedShare.timestamp >= two_days_ago
                )
            )
        )

        if recent_records_count >= 5:
            return jsonify({'success': False, 'error': "Too many requests"}), 429

        if (data.get('download') == 0 and data.get('upload') == 0 and data.get('ping') == 0):
            return jsonify({'success': False, 'error': "The data has not been changed"}), 400

        uuid = get_safe_uuid(15)
        if uuid is None:
            return jsonify({'success': False, 'error': "Can not generate UUID code"}), 400

        new_record = SpeedShare(code=uuid,
                                ip=request.remote_addr,
                                download_speed=data.get('download'),
                                upload_speed=data.get('upload'),
                                ping=data.get('ping'))

        db.session.add(new_record)
        db.session.commit()

        return jsonify({'success': True, 'code': new_record.code}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/share/edit/<string:share_code>', methods=['POST'])
def edit_share(share_code):
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'success': False, 'error': "Can not get data from JSON"}), 400

        field = db.session.scalar(
            sa.select(SpeedShare).where(SpeedShare.code == share_code))

        if field is None:
            return jsonify({'success': False, 'error': "Can not find field"}), 404

        if field.ip != request.remote_addr:
            return jsonify({'success': False, 'error': "Incorrect IP address"}), 502

        if data.get('download') is not None:
            field.download_speed = data.get('download')

        if data.get('upload') is not None:
            field.upload_speed = data.get('upload')

        if data.get('ping') is not None:
            field.ping = data.get('ping')

        uuid = get_safe_uuid(15)
        if uuid is None:
            return jsonify({'success': False, 'error': "Can not generate UUID code"}), 400

        field.code = uuid

        db.session.commit()
        return jsonify({'success': True, 'code': uuid}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/share/status/<string:share_code>', methods=['POST'])
def share_status(share_code):
    try:
        field = db.session.scalar(
            sa.select(SpeedShare).where(SpeedShare.code == share_code))
        return jsonify({"available": field is not None}), 200
    except:
        return jsonify({"available": False}), 200