import sqlalchemy as sa
from app.models import SpeedShare
from app import db
import uuid
import os

def stream_random_bytes(total_bytes, chunk_size = 1024 * 64):
    sent = 0
    while sent < total_bytes:
        to_send = min(chunk_size, total_bytes - sent)
        yield os.urandom(to_send)
        sent += to_send

def get_uuid():
    return str(uuid.uuid4())

def get_safe_uuid(attempts):
    for i in range(attempts):
        new_uuid = get_uuid()
        field = db.session.scalar(
            sa.select(SpeedShare).where(SpeedShare.code == new_uuid))
        if field is None:
            return new_uuid

    return None