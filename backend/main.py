```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, Base, engine, SessionLocal
from models import Bin
from route_optimizer import optimize_route, distance_km


# ==============================
# Request Schemas
# ==============================

class BinCreate(BaseModel):
    bin_code: str
    area: str
    fill_level: int
    latitude: float | None = None
    longitude: float | None = None


class BinUpdate(BaseModel):
    area: str
    fill_level: int
    latitude: float | None = None
    longitude: float | None = None


# ==============================
# Create Database Tables
# ==============================

Base.metadata.create_all(bind=engine)


# ==============================
# Add Sample Bins
# ==============================

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


# ==============================
# Create FastAPI Application
# ==============================

app = FastAPI(
    title="Smart Waste Management API",
    description="Backend API for Smart Waste Management System",
    version="1.0.0"
)


# ==============================
# CORS Configuration
# ==============================

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


# ==============================
# Home Endpoint
# ==============================

@app.get("/")
def home():
    return {
        "message": "Smart Waste Management API is running!",
        "status": "success"
    }


# ==============================
# STEP 1: GET ALL BINS
# ==============================

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


# ==============================
# STEP 2: CREATE NEW BIN
# ==============================

@app.post("/api/bins")
def create_bin(
    bin_data: BinCreate,
    db: Session = Depends(get_db)
):
    existing_bin = (
        db.query(Bin)
        .filter(Bin.bin_code == bin_data.bin_code)
        .first()
    )

    if existing_bin:
        raise HTTPException(
            status_code=400,
            detail="Bin code already exists"
        )

    if bin_data.fill_level < 0 or bin_data.fill_level > 100:
        raise HTTPException(
            status_code=400,
            detail="Fill level must be between 0 and 100"
        )

    if bin_data.fill_level >= 80:
        status = "Critical"
    elif bin_data.fill_level >= 60:
        status = "Warning"
    else:
        status = "Normal"

    new_bin = Bin(
        bin_code=bin_data.bin_code,
        area=bin_data.area,
        fill_level=bin_data.fill_level,
        status=status,
        latitude=bin_data.latitude,
        longitude=bin_data.longitude
    )

    db.add(new_bin)
    db.commit()
    db.refresh(new_bin)

    return {
        "id": new_bin.bin_code,
        "area": new_bin.area,
        "fill_level": new_bin.fill_level,
        "status": new_bin.status
    }


# ==============================
# STEP 3: UPDATE BIN
# ==============================

@app.put("/api/bins/{bin_code}")
def update_bin(
    bin_code: str,
    bin_data: BinUpdate,
    db: Session = Depends(get_db)
):
    bin_item = (
        db.query(Bin)
        .filter(Bin.bin_code == bin_code)
        .first()
    )

    if not bin_item:
        raise HTTPException(
            status_code=404,
            detail="Bin not found"
        )

    if bin_data.fill_level < 0 or bin_data.fill_level > 100:
        raise HTTPException(
            status_code=400,
            detail="Fill level must be between 0 and 100"
        )

    if bin_data.fill_level >= 80:
        status = "Critical"
    elif bin_data.fill_level >= 60:
        status = "Warning"
    else:
        status = "Normal"

    bin_item.area = bin_data.area
    bin_item.fill_level = bin_data.fill_level
    bin_item.status = status
    bin_item.latitude = bin_data.latitude
    bin_item.longitude = bin_data.longitude

    db.commit()
    db.refresh(bin_item)

    return {
        "id": bin_item.bin_code,
        "area": bin_item.area,
        "fill_level": bin_item.fill_level,
        "status": bin_item.status
    }


# ==============================
# STEP 4: DELETE BIN
# ==============================

@app.delete("/api/bins/{bin_code}")
def delete_bin(
    bin_code: str,
    db: Session = Depends(get_db)
):
    bin_item = (
        db.query(Bin)
        .filter(Bin.bin_code == bin_code)
        .first()
    )

    if not bin_item:
        raise HTTPException(
            status_code=404,
            detail="Bin not found"
        )

    db.delete(bin_item)
    db.commit()

    return {
        "message": "Bin deleted successfully",
        "id": bin_code
    }


# ==============================
# STEP 5: DASHBOARD OVERVIEW
# ==============================

@app.get("/api/dashboard/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()

    # Bins with 70% or more fill level need pickup
    pending_pickup = sum(
        1 for bin in bins
        if bin.fill_level >= 70
    )

    # Bins with 80% or more fill level are predicted to overflow
    predicted_overflow = sum(
        1 for bin in bins
        if bin.fill_level >= 80
    )

    # At least one route is active when pickup is pending
    routes_active = 1 if pending_pickup > 0 else 0

    return {
        "pending_pickup": pending_pickup,
        "routes_active": routes_active,
        "today_collections": 0,
        "predicted_overflow": predicted_overflow
    }


# ==============================
# ROUTE OPTIMIZATION
# ==============================

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
```
