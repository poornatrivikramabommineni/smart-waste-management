from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from models import Bin
from route_optimizer import optimize_route

app = FastAPI(
    title="Smart Waste Management API",
    description="Backend API for Smart Waste Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
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

    # Convert database records to dictionaries
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
        from route_optimizer import distance_km

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