from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, Base, engine, SessionLocal
from models import Bin
from route_optimizer import optimize_route, distance_km


# Create database tables
Base.metadata.create_all(bind=engine)


# Add sample bins if database is empty
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
    title="Smart Waste Management API",
    description="Backend API for Smart Waste Management System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://smart-waste-management-4mwdcm41b-smart-waste-management1.vercel.app",
        "https://smart-waste-management-eta.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Smart Waste Management API is running!",
        "status": "success"
    }


@app.get("/api/bins")
def get_bins(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()

    return [
        {
            "id": bin.bin_code,
            "area": bin.area,
            "fill_level": bin.fill_level,
            "status": bin.status
        }
        for bin in bins
    ]


@app.get("/api/route/optimize")
def get_optimized_route(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()

    bin_data = [
        {
            "id": bin.bin_code,
            "area": bin.area,
            "fill_level": bin.fill_level,
            "status": bin.status,
            "latitude": bin.latitude,
            "longitude": bin.longitude
        }
        for bin in bins
    ]

    route = optimize_route(bin_data)

    total_distance = 0

    for i in range(len(route) - 1):
        total_distance += distance_km(
            route[i]["latitude"],
            route[i]["longitude"],
            route[i + 1]["latitude"],
            route[i + 1]["longitude"]
        )

    return {
        "route": route,
        "total_stops": len(route),
        "estimated_distance_km": round(total_distance, 2)
    }