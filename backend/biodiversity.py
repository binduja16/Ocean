# backend/biodiversity.py
from fastapi import APIRouter, Query, HTTPException
import requests
import random
import time
from collections import Counter
from scipy.stats import entropy
from typing import List, Dict, Any, Optional

router = APIRouter()

# -------------------------------
# Simple in-memory TTL cache
# -------------------------------
_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 60 * 60  # 1 hour


def _get_cache(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if not entry:
        return None
    if time.time() - entry["ts"] > CACHE_TTL:
        del _cache[key]
        return None
    return entry["value"]


def _set_cache(key: str, value: Any):
    _cache[key] = {"ts": time.time(), "value": value}


# -------------------------------
# Small fallback species DB (used for simulation)
# -------------------------------
species_db = [
    "Thunnus albacares (Yellowfin Tuna)",
    "Sardinella longiceps (Indian Oil Sardine)",
    "Clupea harengus (Atlantic Herring)",
    "Scomber japonicus (Chub Mackerel)",
    "Lutjanus argentimaculatus (Mangrove Snapper)",
    "Plankton sp. A",
    "Plankton sp. B",
    "Coral symbiont DNA fragment",
]


# -------------------------------
# Helper: simulate biodiversity (fallback)
# -------------------------------
def simulate_biodiversity(error: str = None) -> Dict[str, Any]:
    richness = random.randint(5, min(20, len(species_db)))
    shannon_index = round(random.uniform(1.5, 3.5), 2)
    sample_species = random.sample(species_db, min(richness, len(species_db)))
    return {
        "richness": richness,
        "shannon_index": shannon_index,
        "species": sample_species,
        "note": f"Simulated data used ({error})" if error else "Simulated data",
    }


# -------------------------------
# Core: fetch biodiversity metrics from OBIS (or fallback)
# -------------------------------
def fetch_biodiversity_metrics(lat: float, lon: float, radius: float = 50) -> Dict[str, Any]:
    """
    Returns: { richness, shannon_index, species: [names], note? }
    Caches results for CACHE_TTL seconds.
    """
    cache_key = f"biodiv_{round(lat,6)}_{round(lon,6)}_{int(radius)}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    try:
        # Convert radius (km) to degrees (approx 1 deg lat ~ 111 km)
        delta = radius / 111.0
        lon1, lon2 = lon - delta, lon + delta
        lat1, lat2 = lat - delta, lat + delta

        # Build POLYGON for OBIS
        polygon = f"POLYGON(({lon1} {lat1}, {lon2} {lat1}, {lon2} {lat2}, {lon1} {lat2}, {lon1} {lat1}))"

        url = "https://api.obis.org/v3/occurrence"
        params = {"geometry": polygon, "size": 500}

        resp = requests.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            return simulate_biodiversity(error=f"OBIS status {resp.status_code}")

        js = resp.json()
        results = js.get("results", []) if isinstance(js, dict) else []

        species_list = [
            (item.get("scientificName") or item.get("species") or item.get("vernacularName"))
            for item in results
            if (item.get("scientificName") or item.get("species") or item.get("vernacularName"))
        ]

        species_list = [s.strip() for s in species_list if isinstance(s, str) and s.strip()]

        if not species_list:
            out = simulate_biodiversity(error="No OBIS records in area")
            _set_cache(cache_key, out)
            return out

        counts = Counter(species_list)
        total = sum(counts.values())
        freqs = [v / total for v in counts.values()]

        try:
            shannon = float(entropy(freqs))
        except Exception:
            shannon = 0.0

        richness = len(counts)
        top_species = [{"species": sp, "count": c, "share": round(c / total, 4)} for sp, c in counts.most_common(20)]

        out = {
            "richness": richness,
            "shannon_index": round(shannon, 3),
            "species": list(counts.keys()),
            "top_species": top_species,
            "total_records": total,
        }

        _set_cache(cache_key, out)
        return out

    except Exception as e:
        return simulate_biodiversity(error=str(e))


# -------------------------------
# API: Species list
# -------------------------------
@router.get("/species")
def get_species(lat: float = Query(...), lon: float = Query(...)):
    data = fetch_biodiversity_metrics(lat, lon, radius=50)
    return {
        "species": data.get("species", []),
        "total_records": data.get("total_records", 0),
        "note": data.get("note"),
    }


# -------------------------------
# API: Diversity metrics
# -------------------------------
@router.get("/diversity")
def get_diversity(lat: float = Query(...), lon: float = Query(...)):
    data = fetch_biodiversity_metrics(lat, lon, radius=50)
    return {
        "richness": data.get("richness", 0),
        "shannon_index": data.get("shannon_index", 0),
        "top_species": data.get("top_species", []),
        "note": data.get("note"),
    }


# -------------------------------
# API: Heatmap points (geocode + simulated)
# -------------------------------
@router.get("/heatmap")
def get_heatmap(city: str = Query(...)):
    """
    Return heatmap points for any given city in India (or worldwide).
    """
    try:
        geocode_url = f"https://nominatim.openstreetmap.org/search?city={city}&format=json&limit=1"
        res = requests.get(geocode_url, timeout=10).json()

        if not res:
            return {"error": f"City '{city}' not found"}

        lat, lon = float(res[0]["lat"]), float(res[0]["lon"])

        points = []
        for _ in range(8):  # generate 8 points
            offset_lat = lat + random.uniform(-0.3, 0.3)  # ~30 km radius
            offset_lon = lon + random.uniform(-0.3, 0.3)
            richness = random.randint(20, 150)
            points.append({"lat": offset_lat, "lon": offset_lon, "richness": richness})

        return points

    except Exception as e:
        return {"error": str(e)}


# -------------------------------
# API: Biodiversity Trends (2015–2025 simulated)
# -------------------------------
@router.get("/trends")
def get_trends(lat: float = Query(...), lon: float = Query(...)):
    try:
        trend_data = [
            {"year": 2015, "richness": 110, "shannon": 2.80},
            {"year": 2016, "richness": 115, "shannon": 2.85},
            {"year": 2017, "richness": 118, "shannon": 2.88},
            {"year": 2018, "richness": 120, "shannon": 2.90},
            {"year": 2019, "richness": 125, "shannon": 2.95},
            {"year": 2020, "richness": 123, "shannon": 2.92},
            {"year": 2021, "richness": 130, "shannon": 3.00},
            {"year": 2022, "richness": 135, "shannon": 3.05},
            {"year": 2023, "richness": 140, "shannon": 3.10},
            {"year": 2024, "richness": 145, "shannon": 3.18},
            {"year": 2025, "richness": 150, "shannon": 3.25},
        ]
        return {"trends": trend_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
