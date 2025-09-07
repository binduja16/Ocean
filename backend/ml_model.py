# ml_model.py
def predict_fishing(temp, wind, sst):
    """
    ML model placeholder.
    Returns string advice based on SST, temp, wind.
    """
    if sst is None:
        return f"Moderate fishing conditions based on temp {temp}°C and wind {wind} m/s."
    if 26 <= sst <= 30 and wind < 10:
        return "Good fishing conditions – tuna likely nearby 🎣"
    else:
        return "Not ideal conditions – fewer fish expected ❌"
