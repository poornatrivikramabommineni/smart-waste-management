```javascript
import React, { useEffect, useState } from "react";

// Dashboard connected to live FastAPI overview
import { createRoot } from "react-dom/client";
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
  RefreshCw
} from "lucide-react";

import "./style.css";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch bin data from FastAPI
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

  // Fetch collection overview from FastAPI
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

  // Load data when application starts
  useEffect(() => {
    fetchBins();
    fetchOverview();
  }, []);

  // Refresh both bin data and overview
  const refreshAll = () => {
    fetchBins();
    fetchOverview();
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
                  "nav " +
                  (page === name ? "active" : "")
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
              .filter((bin) => bin.fill_level >= 80)
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


function Card({ title, value, icon: Icon }) {

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


function Metric({ label, value }) {

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


function Generic({ page }) {

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
              This module will be connected to our FastAPI
              backend as we continue building the project.
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
```
