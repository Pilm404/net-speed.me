from datetime import datetime, timedelta, timezone
from flask import jsonify, request
import sqlalchemy as sa

from app.models import SpeedShare
from app.util import get_safe_uuid
from app import app, db


@app.route('/api/share/<string:share_code>', methods=['GET'])
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