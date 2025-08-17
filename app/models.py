from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

class SpeedShare(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    code: so.Mapped[str] = so.mapped_column(sa.String(36), unique=True, index=True)
    ip: so.Mapped[Optional[str]] = so.mapped_column(sa.String(45), index=True)
    upload_speed: so.Mapped[Optional[float]] = so.mapped_column(sa.Float)
    download_speed: so.Mapped[Optional[float]] = so.mapped_column(sa.Float)
    ping: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer)
    timestamp: so.Mapped[datetime] = so.mapped_column(index=True, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return '<SpeedShare IP:{} Down:{} Up:{} Ping:{}ms>'.format(self.ip, self.download_speed, self.upload_speed, self.ping)