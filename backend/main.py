from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, Base, engine, SessionLocal
from models import Bin
from route_optimizer import optimize_route

Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(Bin).count() == 0:
    sample_bins = [
        Bin(
            bin_code="BIN-101",
            area="Main Street",
            fill_level=42,
            status="Normal",
            latitude=17.6868,
            longitude=83.2185
        ),
        Bin(
            bin_code="BIN-102",
            area="Market Road",
            fill_level=91,
            status="Critical",
            latitude=17.688,
            longitude=83.220
        ),
        Bin(
            bin_code="BIN-103",
            area="College Road",
            fill_level=73,
            status="Warning",
            latitude=17.690,
            longitude=83.215
        )
    ]

    db.add_all(sample_bins)
    db.commit()

db.close()

app = FastAPI(