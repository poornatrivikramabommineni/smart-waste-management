from math import radians, sin, cos, sqrt, atan2


def distance_km(lat1, lon1, lat2, lon2):
    """
    Calculate approximate distance between two GPS coordinates.
    """
    R = 6371.0

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def optimize_route(bins):
    """
    Simple priority + nearest-neighbor route optimization.

    Critical bins are prioritized first.
    Then the nearest bin is selected.
    """

    if not bins:
        return []

    # Sort primarily by fill level.
    remaining = sorted(
        bins,
        key=lambda x: x["fill_level"],
        reverse=True
    )

    route = []

    # Start from the first/highest priority bin.
    current = remaining.pop(0)
    route.append(current)

    while remaining:

        nearest = min(
            remaining,
            key=lambda x: distance_km(
                current["latitude"],
                current["longitude"],
                x["latitude"],
                x["longitude"]
            )
        )

        route.append(nearest)
        remaining.remove(nearest)
        current = nearest

    return route