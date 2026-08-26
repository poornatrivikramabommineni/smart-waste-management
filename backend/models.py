from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(50), unique=True, nullable=False)
    area = Column(String(100), nullable=False)
    fill_level = Column(Integer, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="Normal")
    latitude = Column(Float)
    longitude = Column(Float)
    last_updated = Column(DateTime)