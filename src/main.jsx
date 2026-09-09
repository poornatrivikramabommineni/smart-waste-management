import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Map,
  Trash2,
  AlertTriangle,
  Truck,
  BrainCircuit,
  BarChart3,
  Menu,
  X,
  Leaf,
  RefreshCw,
  Plus,
  Edit,
  Trash
} from "lucide-react";

import "./style.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = "https://smart-waste-management-1-2r9a.onrender.com";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [open, setOpen] = useState(false);
  const [bins, setBins] = useState([]);

  const [overview, setOverview] = useState({
    pending_pickup: 0,
    routes_active: 0,
    today_collections: 0,
    predicted_overflow: 0
  });

  const [routeData, setRouteData] = useState({
    route: [],
    total_stops: 0,
    estimated_distance_km: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/bins`);

      if (!response.ok) {
        throw new Error("Failed to fetch bin data");
      }

      const data = await response.json();
      setBins(data);
    } catch (err) {
      console.error(err);
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/overview`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard overview");
      }

      const data = await response.json();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/route/optimize`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch optimized route");
      }

      const data = await response.json();
      setRouteData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBins();
    fetchOverview();
    fetchRoute();
  }, []);

  const refreshAll = () => {
    fetchBins();
    fetchOverview();
    fetchRoute();
  };

  const nav = [
    ["Dashboard", LayoutDashboard],
    ["Live Map", Map],
    ["Bin Management", Trash2],
    ["Alerts", AlertTriangle],
    ["Route Optimization", Truck],
    ["Predictions", BrainCircuit],
    ["Analytics", BarChart3]
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-500/15 p-2">
              <Leaf className="text-emerald-400" />
            </div>

            <div>

              <h1 className="font-bold text-lg">
                SmartWaste
              </h1>

              <p className="text-xs text-slate-400">
                Intelligent Collection System
              </p>

            </div>

          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>

        </div>
      </header>


      <div className="mx-auto flex max-w-7xl">

        <aside
          className={
            (open ? "block" : "hidden") +
            " md:block w-full md:w-60 shrink-0 border-r border-slate-800 p-4"
          }
        >

          <div className="space-y-1">

            {nav.map(([name, Icon]) => (

              <button
                key={name}
                onClick={() => {
                  setPage(name);
                  setOpen(false);
                }}
                className={
                  "nav " + (page === name ? "active" : "")
                }
              >

                <Icon size={18} />

                {name}

              </button>

            ))}

          </div>

        </aside>


        <main className="min-w-0 flex-1 p-5 md:p-8">

          {page === "Dashboard" ? (

            <Dashboard
              bins={bins}
              overview={overview}
              loading={loading}
              error={error}
              refresh={refreshAll}
            />

          ) : page === "Route Optimization" ? (

            <RouteOptimization
              routeData={routeData}
              loading={loading}
              refresh={fetchRoute}
            />

          ) : page === "Alerts" ? (

  <Alerts />

) : page === "Predictions" ? (

  <Predictions />

) : page === "Analytics" ? (

  <Analytics />

) : page === "Live Map" ? (

  <LiveMap />

) : (

  <Generic page={page} />

)}

        </main>

      </div>

    </div>
  );
}


function Dashboard({
  bins,
  overview,
  loading,
  error,
  refresh
}) {

  const normal = bins.filter(
    (b) => b.fill_level < 60
  ).length;

  const warning = bins.filter(
    (b) =>
      b.fill_level >= 60 &&
      b.fill_level < 80
  ).length;

  const critical = bins.filter(
    (b) => b.fill_level >= 80
  ).length;

  return (
    <>

      <div className="mb-8">

        <p className="text-emerald-400 text-sm font-semibold">
          SMART CITY OPERATIONS
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="mt-1 text-3xl font-bold">
              Waste Management Dashboard
            </h2>

            <p className="mt-2 text-slate-400">
              Live data from SmartWaste FastAPI backend.
            </p>

          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          >

            <RefreshCw size={16} />

            Refresh

          </button>

        </div>

      </div>


      {error && (

        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">

          ⚠️ {error}

        </div>

      )}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card
          title="Total Bins"
          value={bins.length}
          icon={Trash2}
        />

        <Card
          title="Normal"
          value={normal}
          icon={Leaf}
        />

        <Card
          title="Warning"
          value={warning}
          icon={AlertTriangle}
        />

        <Card
          title="Critical"
          value={critical}
          icon={AlertTriangle}
        />

      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        <section className="panel lg:col-span-2">

          <div className="flex justify-between">

            <h3 className="font-semibold">
              Live Bin Status
            </h3>

            <span className="text-xs text-emerald-400">
              ● API CONNECTED
            </span>

          </div>


          {loading ? (

            <p className="mt-6 text-slate-400">
              Loading bin data...
            </p>

          ) : (

            <div className="mt-5 space-y-5">

              {bins.map((bin) => (

                <div key={bin.id}>

                  <div className="flex justify-between text-sm">

                    <span>
                      {bin.id} · {bin.area}
                    </span>

                    <span>
                      {bin.fill_level}%
                    </span>

                  </div>


                  <div className="mt-2 h-2 rounded-full bg-slate-800">

                    <div
                      className={
                        "h-2 rounded-full " +
                        (
                          bin.fill_level >= 80
                            ? "bg-red-400"
                            : bin.fill_level >= 60
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        )
                      }
                      style={{
                        width: `${bin.fill_level}%`
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        <section className="panel">

          <h3 className="font-semibold">
            Priority Alerts
          </h3>

          <div className="mt-4 space-y-3">

            {bins
              .filter(
                (bin) => bin.fill_level >= 80
              )
              .map((bin) => (

                <div
                  className="alert"
                  key={bin.id}
                >

                  <AlertTriangle size={18} />

                  <div>

                    <b>
                      {bin.id} needs pickup
                    </b>

                    <p>
                      {bin.fill_level}% full · {bin.area}
                    </p>

                  </div>

                </div>

              ))}

          </div>

        </section>

      </div>


      <div className="mt-6 panel">

        <h3 className="font-semibold">
          Collection Overview
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

          <Metric
            label="Pending Pickup"
            value={overview.pending_pickup}
          />

          <Metric
            label="Routes Active"
            value={overview.routes_active}
          />

          <Metric
            label="Today's Collections"
            value={overview.today_collections}
          />

          <Metric
            label="Predicted Overflow"
            value={overview.predicted_overflow}
          />

        </div>

      </div>

    </>
  );
}


function RouteOptimization({
  routeData,
  loading,
  refresh
}) {

  return (
    <div>

      <div className="mb-8">

        <p className="text-emerald-400 text-sm font-semibold">
          SMART CITY OPERATIONS
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="mt-1 text-3xl font-bold">
              Route Optimization
            </h2>

            <p className="mt-2 text-slate-400">
              Optimized collection route generated by FastAPI.
            </p>

          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          >

            <RefreshCw size={16} />

            Refresh Route

          </button>

        </div>

      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Card
          title="Total Stops"
          value={routeData.total_stops}
          icon={Truck}
        />

        <Card
          title="Estimated Distance"
          value={`${routeData.estimated_distance_km} km`}
          icon={Map}
        />

        <Card
          title="Route Status"
          value={
            routeData.route.length > 0
              ? "Ready"
              : "No Route"
          }
          icon={Leaf}
        />

      </div>


      <section className="panel mt-6">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold">
            Optimized Collection Route
          </h3>

          <span className="text-xs text-emerald-400">
            ● FASTAPI
          </span>

        </div>


        {loading ? (

          <p className="mt-6 text-slate-400">
            Loading route...
          </p>

        ) : routeData.route.length === 0 ? (

          <p className="mt-6 text-slate-400">
            No route data available.
          </p>

        ) : (

          <div className="mt-5 space-y-3">

            {routeData.route.map((bin, index) => (

              <div
                key={bin.id || index}
                className="flex items-center gap-4 rounded-xl bg-slate-900 p-4"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-bold text-emerald-400">

                  {index + 1}

                </div>


                <div className="flex-1">

                  <p className="font-semibold">
                    {bin.id}
                  </p>

                  <p className="text-sm text-slate-400">
                    {bin.area}
                  </p>

                </div>


                <div className="text-right">

                  <p className="font-semibold">
                    {bin.fill_level}%
                  </p>

                  <p className="text-xs text-slate-500">
                    Fill Level
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}


function Alerts() {

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bins`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      const alertBins = data.filter(
        (bin) => bin.fill_level >= 60
      );

      setAlerts(alertBins);

    } catch (err) {

      console.error(err);
      setError("Failed to load alerts");

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchAlerts();
  }, []);


  const critical = alerts.filter(
    (bin) => bin.fill_level >= 80
  );

  const warning = alerts.filter(
    (bin) =>
      bin.fill_level >= 60 &&
      bin.fill_level < 80
  );


  return (
    <div>

      <div className="mb-8">

        <p className="text-emerald-400 text-sm font-semibold">
          SMART CITY OPERATIONS
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="mt-1 text-3xl font-bold">
              Alerts
            </h2>

            <p className="mt-2 text-slate-400">
              Live alerts generated from bin fill levels.
            </p>

          </div>

          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          >

            <RefreshCw size={16} />

            Refresh Alerts

          </button>

        </div>

      </div>


      {error && (

        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">

          ⚠️ {error}

        </div>

      )}


      <div className="grid gap-4 sm:grid-cols-2">

        <Card
          title="Critical Alerts"
          value={critical.length}
          icon={AlertTriangle}
        />

        <Card
          title="Warning Alerts"
          value={warning.length}
          icon={AlertTriangle}
        />

      </div>


      <section className="panel mt-6">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold">
            Active Alerts
          </h3>

          <span className="text-xs text-emerald-400">
            ● API CONNECTED
          </span>

        </div>


        {loading ? (

          <p className="mt-6 text-slate-400">
            Loading alerts...
          </p>

        ) : alerts.length === 0 ? (

          <div className="mt-6 rounded-xl bg-emerald-500/10 p-5 text-center">

            <Leaf
              className="mx-auto text-emerald-400"
              size={32}
            />

            <p className="mt-2 font-semibold">
              No active alerts
            </p>

            <p className="mt-1 text-sm text-slate-400">
              All bins are currently below the warning level.
            </p>

          </div>

        ) : (

          <div className="mt-5 space-y-4">

            {alerts.map((bin) => {

              const isCritical =
                bin.fill_level >= 80;

              return (

                <div
                  key={bin.id}
                  className={
                    "rounded-xl border p-5 " +
                    (
                      isCritical
                        ? "border-red-800 bg-red-950/30"
                        : "border-amber-800 bg-amber-950/30"
                    )
                  }
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={
                        "rounded-full p-3 " +
                        (
                          isCritical
                            ? "bg-red-500/15"
                            : "bg-amber-500/15"
                        )
                      }
                    >

                      <AlertTriangle
                        size={22}
                        className={
                          isCritical
                            ? "text-red-400"
                            : "text-amber-400"
                        }
                      />

                    </div>


                    <div className="flex-1">

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <div>

                          <h4 className="font-bold">
                            {bin.id}
                          </h4>

                          <p className="text-sm text-slate-400">
                            {bin.area}
                          </p>

                        </div>


                        <span
                          className={
                            "rounded-full px-3 py-1 text-xs font-bold " +
                            (
                              isCritical
                                ? "bg-red-500/15 text-red-300"
                                : "bg-amber-500/15 text-amber-300"
                            )
                          }
                        >

                          {isCritical
                            ? "CRITICAL"
                            : "WARNING"}

                        </span>

                      </div>


                      <div className="mt-4">

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-400">
                            Fill Level
                          </span>

                          <span className="font-bold">
                            {bin.fill_level}%
                          </span>

                        </div>


                        <div className="mt-2 h-2 rounded-full bg-slate-800">

                          <div
                            className={
                              "h-2 rounded-full " +
                              (
                                isCritical
                                  ? "bg-red-400"
                                  : "bg-amber-400"
                              )
                            }
                            style={{
                              width: `${bin.fill_level}%`
                            }}
                          />

                        </div>

                      </div>


                      <p className="mt-4 text-sm">

                        {isCritical
                          ? "Immediate pickup required."
                          : "Pickup recommended soon."}

                      </p>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </div>
  );
}


function BinManagement() {

  // Bin Management code will go here
  const [bins, setBins] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const fetchBins = async () => {
  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/api/bins`);

    if (!response.ok) {
      throw new Error("Failed to fetch bins");
    }

    const data = await response.json();
    setBins(data);
    setError("");
  } catch (err) {
    setError("Unable to load bins");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBins();
}, []);

return (
  <div className="space-y-6">

    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Bin Management</h2>
        <p className="text-gray-500">
          Manage and monitor all waste bins
        </p>
      </div>

      <button
        onClick={fetchBins}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        <RefreshCw size={18} />
        Refresh
      </button>
    </div>

    {loading && (
      <p className="text-gray-500">Loading bins...</p>
    )}

    {error && (
      <p className="text-red-500">{error}</p>
    )}

    {!loading && !error && (
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Bin ID</th>
              <th className="text-left p-4">Area</th>
              <th className="text-left p-4">Fill Level</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {bins.map((bin) => (
              <tr key={bin.id} className="border-t">

                <td className="p-4 font-medium">
                  {bin.id}
                </td>

                <td className="p-4">
                  {bin.area}
                </td>

                <td className="p-4">
                  {bin.fill_level}%
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      bin.status === "Critical"
                        ? "bg-red-100 text-red-700"
                        : bin.status === "Warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {bin.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>
    )}

  </div>
);

}

function Predictions() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/bins`);

      if (!response.ok) {
        throw new Error("Failed to fetch prediction data");
      }

      const data = await response.json();
      setBins(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const getPrediction = (fillLevel) => {
    if (fillLevel >= 80) {
      return "Overflow likely soon";
    }

    if (fillLevel >= 60) {
      return "Pickup recommended soon";
    }

    return "No immediate overflow";
  };

  return (
    <div>

      <div className="mb-8">
        <p className="text-emerald-400 text-sm font-semibold">
          SMART CITY OPERATIONS
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="mt-1 text-3xl font-bold">
              Waste Predictions
            </h2>

            <p className="mt-2 text-slate-400">
              Predict potential bin overflow using current fill levels.
            </p>
          </div>

          <button
            onClick={fetchPredictions}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          >
            <RefreshCw size={16} />
            Refresh Predictions
          </button>

        </div>
      </div>


      {loading ? (

        <p className="text-slate-400">
          Loading predictions...
        </p>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {bins.map((bin) => (

            <section
              key={bin.id}
              className="panel"
            >

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-bold text-lg">
                    {bin.id}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {bin.area}
                  </p>
                </div>

                <BrainCircuit
                  size={22}
                  className="text-emerald-400"
                />

              </div>


              <div className="mt-6">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-400">
                    Current Fill Level
                  </span>

                  <span className="font-bold">
                    {bin.fill_level}%
                  </span>

                </div>


                <div className="mt-2 h-3 rounded-full bg-slate-800">

                  <div
                    className={
                      "h-3 rounded-full " +
                      (
                        bin.fill_level >= 80
                          ? "bg-red-400"
                          : bin.fill_level >= 60
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      )
                    }
                    style={{
                      width: `${bin.fill_level}%`
                    }}
                  />

                </div>

              </div>


              <div className="mt-6 rounded-xl bg-slate-900 p-4">

                <p className="text-xs text-slate-400">
                  Prediction
                </p>

                <p className="mt-2 font-semibold">
                  {getPrediction(bin.fill_level)}
                </p>

              </div>

            </section>

          ))}

        </div>

      )}

    </div>
  );
}

function Analytics() {
  const [bins, setBins] = useState([]);
  const [overview, setOverview] = useState({
    pending_pickup: 0,
    routes_active: 0,
    today_collections: 0,
    predicted_overflow: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const binsResponse = await fetch(`${API_URL}/api/bins`);
      const overviewResponse = await fetch(
        `${API_URL}/api/dashboard/overview`
      );

      if (!binsResponse.ok || !overviewResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const binsData = await binsResponse.json();
      const overviewData = await overviewResponse.json();

      setBins(binsData);
      setOverview(overviewData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const normal = bins.filter(
    (bin) => bin.fill_level < 60
  ).length;

  const warning = bins.filter(
    (bin) => bin.fill_level >= 60 && bin.fill_level < 80
  ).length;

  const critical = bins.filter(
    (bin) => bin.fill_level >= 80
  ).length;

  const averageFill =
    bins.length > 0
      ? Math.round(
          bins.reduce(
            (total, bin) => total + bin.fill_level,
            0
          ) / bins.length
        )
      : 0;

  const highestBin =
    bins.length > 0
      ? bins.reduce((highest, bin) =>
          bin.fill_level > highest.fill_level
            ? bin
            : highest
        )
      : null;

  return (
    <div>

      <div className="mb-8">
        <p className="text-emerald-400 text-sm font-semibold">
          SMART CITY OPERATIONS
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="mt-1 text-3xl font-bold">
              Analytics
            </h2>

            <p className="mt-2 text-slate-400">
              Waste collection performance and bin statistics.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          >
            <RefreshCw size={16} />
            Refresh Analytics
          </button>

        </div>
      </div>

      {loading ? (

        <p className="text-slate-400">
          Loading analytics...
        </p>

      ) : (

        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Card
              title="Total Bins"
              value={bins.length}
              icon={Trash2}
            />

            <Card
              title="Average Fill Level"
              value={`${averageFill}%`}
              icon={BarChart3}
            />

            <Card
              title="Pending Pickup"
              value={overview.pending_pickup}
              icon={Truck}
            />

            <Card
              title="Predicted Overflow"
              value={overview.predicted_overflow}
              icon={BrainCircuit}
            />

          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <section className="panel">

              <h3 className="font-semibold">
                Bin Status Distribution
              </h3>

              <div className="mt-6 space-y-5">

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Normal</span>
                    <span>{normal} bins</span>
                  </div>

                  <div className="mt-2 h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-emerald-400"
                      style={{
                        width: `${
                          bins.length
                            ? (normal / bins.length) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Warning</span>
                    <span>{warning} bins</span>
                  </div>

                  <div className="mt-2 h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-amber-400"
                      style={{
                        width: `${
                          bins.length
                            ? (warning / bins.length) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Critical</span>
                    <span>{critical} bins</span>
                  </div>

                  <div className="mt-2 h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-red-400"
                      style={{
                        width: `${
                          bins.length
                            ? (critical / bins.length) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>

              </div>

            </section>

            <section className="panel">

              <h3 className="font-semibold">
                Collection Performance
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4">

                <Metric
                  label="Pending Pickup"
                  value={overview.pending_pickup}
                />

                <Metric
                  label="Routes Active"
                  value={overview.routes_active}
                />

                <Metric
                  label="Today's Collections"
                  value={overview.today_collections}
                />

                <Metric
                  label="Predicted Overflow"
                  value={overview.predicted_overflow}
                />

              </div>

            </section>

          </div>

          <section className="panel mt-6">

            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Highest Fill Level
              </h3>

              <span className="text-xs text-emerald-400">
                ● LIVE DATA
              </span>
            </div>

            {highestBin ? (

              <div className="mt-5 rounded-xl bg-slate-900 p-5">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-xl font-bold">
                      {highestBin.id}
                    </p>

                    <p className="text-sm text-slate-400">
                      {highestBin.area}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {highestBin.fill_level}%
                    </p>

                    <p className="text-xs text-slate-500">
                      Current Fill Level
                    </p>
                  </div>

                </div>

                <div className="mt-4 h-3 rounded-full bg-slate-800">

                  <div
                    className={
                      "h-3 rounded-full " +
                      (
                        highestBin.fill_level >= 80
                          ? "bg-red-400"
                          : highestBin.fill_level >= 60
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      )
                    }
                    style={{
                      width: `${highestBin.fill_level}%`
                    }}
                  />

                </div>

              </div>

            ) : (

              <p className="mt-5 text-slate-400">
                No bin data available.
              </p>

            )}

          </section>

        </>

      )}

    </div>
  );
}
function LiveMap() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBins = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/bins`);

        if (!response.ok) {
          throw new Error("Failed to fetch bins");
        }

        const data = await response.json();

        console.log("Live Map bins:", data);

        setBins(data);
      } catch (error) {
        console.error("Map API Error:", error);
        setError("Unable to load bin locations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, []);

  useEffect(() => {
    if (loading || bins.length === 0) {
      return;
    }

    const container = document.getElementById("live-map");

    if (!container) {
      console.error("Map container not found");
      return;
    }

    const map = L.map(container).setView(
      [16.5062, 80.6480],
      10
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors"
      }
    ).addTo(map);

    bins.forEach((bin, index) => {
      const lat =
        bin.latitude ?? (16.5062 + index * 0.03);

      const lng =
        bin.longitude ?? (80.6480 + index * 0.03);

      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        <div style="min-width:180px">
          <strong>${bin.id}</strong>
          <br />
          Area: ${bin.area}
          <br />
          Fill Level: ${bin.fill_level}%
          <br />
          Status: ${bin.status}
        </div>
      `);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
    };
  }, [bins, loading]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-400 text-sm font-semibold">
            SMART CITY OPERATIONS
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Live Map
          </h2>

          <p className="mt-2 text-slate-400">
            Real-time waste bin locations and status.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="panel">
          <p className="text-slate-400">
            Loading bin locations...
          </p>
        </div>
      ) : bins.length === 0 ? (
        <div className="panel">
          <p className="text-slate-400">
            No bin data available.
          </p>
        </div>
      ) : (
        <section className="panel">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">
                Bin Locations
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                {bins.length} bins connected to FastAPI
              </p>
            </div>

            <span className="text-xs text-emerald-400">
              ● LIVE DATA
            </span>
          </div>

          <div
            id="live-map"
            style={{
              width: "100%",
              height: "500px",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          />

        </section>
      )}

      {!loading && bins.length > 0 && (
        <section className="panel">

          <h3 className="font-semibold mb-4">
            Bin Status
          </h3>

          <div className="grid gap-3 md:grid-cols-3">

            {bins.map((bin) => (
              <div
                key={bin.id}
                className="rounded-xl bg-slate-900 p-4"
              >

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {bin.id}
                    </p>

                    <p className="text-sm text-slate-400">
                      {bin.area}
                    </p>
                  </div>

                  <span
                    className={
                      "rounded-full px-2 py-1 text-xs font-semibold " +
                      (
                        bin.fill_level >= 80
                          ? "bg-red-500/15 text-red-300"
                          : bin.fill_level >= 60
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      )
                    }
                  >
                    {bin.status}
                  </span>
                </div>

                <div className="mt-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Fill Level
                    </span>

                    <span className="font-bold">
                      {bin.fill_level}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-slate-800">

                    <div
                      className={
                        "h-2 rounded-full " +
                        (
                          bin.fill_level >= 80
                            ? "bg-red-400"
                            : bin.fill_level >= 60
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        )
                      }
                      style={{
                        width: `${bin.fill_level}%`
                      }}
                    />

                  </div>

                </div>

              </div>
            ))}

          </div>

        </section>
      )}

    </div>
  );
}


function Card({
  title,
  value,
  icon: Icon
}) {

  return (
    <div className="panel">

      <div className="flex justify-between">

        <span className="text-sm text-slate-400">
          {title}
        </span>

        <Icon
          size={18}
          className="text-emerald-400"
        />

      </div>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        From FastAPI
      </p>

    </div>
  );
}


  );
}


function Metric({
  label,
  value
}) {

  return (
    <div className="rounded-xl bg-slate-900 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


function Generic({
  page
}) {

  return (
    <div>

      <p className="text-emerald-400 text-sm font-semibold">
        SMARTWASTE MODULE
      </p>

      <h2 className="mt-1 text-3xl font-bold">
        {page}
      </h2>

      <div className="mt-6 panel">

        <div className="h-72 grid place-items-center text-center">

          <div>

            <div className="mx-auto mb-4 w-fit rounded-full bg-emerald-500/10 p-5">

              <BrainCircuit
                className="text-emerald-400"
                size={40}
              />

            </div>

            <h3 className="text-xl font-semibold">
              {page} module
            </h3>

            <p className="mt-2 max-w-md text-slate-400">
              This module will be connected to our
              FastAPI backend as we continue building
              the project.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


createRoot(
  document.getElementById("root")
).render(<App />);
}