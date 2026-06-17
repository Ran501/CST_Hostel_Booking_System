"use client";

import { useState, useEffect } from "react";

// ─── Icon helpers ──────────────────────────────────────────────────────────

const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  chart:    "M18 20V10M12 20V4M6 20v-6",
  chevron:  "M9 18l6-6-6-6",
  chevronD: "M6 9l6 6 6-6",
  dot:      "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
  male:     "M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 22c0-4 3.6-7 8-7s8 3 8 7",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  floor:    "M3 12h18M3 6h18M3 18h18",
  info:     "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .adm-root {
    --bg:        #f7f6f3;
    --surface:   #ffffff;
    --border:    #e8e6e1;
    --border2:   #d1cfc9;
    --text:      #1a1916;
    --muted:     #7a786f;
    --accent:    #2d6a4f;
    --accent-lt: #d8f3e3;
    --warn:      #b5451b;
    --warn-lt:   #fde8df;
    --info:      #1d4e8f;
    --info-lt:   #ddeeff;
    --yellow:    #a16207;
    --yellow-lt: #fef9c3;
    --font:      'Sora', sans-serif;
    --mono:      'JetBrains Mono', monospace;
    --radius:    10px;
    --shadow:    0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);

    font-family: var(--font);
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding: 2rem;
    box-sizing: border-box;
  }

  .adm-root *, .adm-root *::before, .adm-root *::after { box-sizing: border-box; }

  .adm-header { margin-bottom: 2rem; }
  .adm-title  { font-size: 1.5rem; font-weight: 600; letter-spacing: -.02em; }
  .adm-sub    { font-size: .8rem; color: var(--muted); margin-top: .2rem; font-family: var(--mono); }

  .adm-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
  .adm-grid-1 { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem; }

  @media(max-width:900px) { .adm-grid-4 { grid-template-columns: 1fr 1fr; } }
  @media(max-width:600px) { .adm-grid-4 { grid-template-columns: 1fr; } }

  .adm-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .adm-card-pad { padding: 1.25rem 1.5rem; }

  .adm-stat { padding: 1.25rem 1.5rem; }
  .adm-stat-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: .5rem; }
  .adm-stat-value { font-size: 2rem; font-weight: 600; letter-spacing: -.03em; line-height: 1; }
  .adm-stat-sub   { font-size: .75rem; color: var(--muted); margin-top: .35rem; }
  .adm-stat-icon  { margin-bottom: .75rem; color: var(--muted); }

  .adm-badge {
    display: inline-flex; align-items: center; gap: .3rem;
    font-size: .68rem; font-weight: 500; padding: .2rem .55rem;
    border-radius: 999px; letter-spacing: .03em;
  }
  .adm-badge-green  { background: var(--accent-lt); color: var(--accent); }
  .adm-badge-red    { background: var(--warn-lt);   color: var(--warn);   }
  .adm-badge-blue   { background: var(--info-lt);   color: var(--info);   }
  .adm-badge-yellow { background: var(--yellow-lt); color: var(--yellow); }
  .adm-badge-gray   { background: var(--border);    color: var(--muted);  }

  .adm-sect-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.5rem; border-bottom: 1px solid var(--border);
  }
  .adm-sect-title { font-size: .85rem; font-weight: 600; }
  .adm-sect-count { font-size: .75rem; color: var(--muted); font-family: var(--mono); }

  .adm-progress { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .adm-progress-fill { height: 100%; border-radius: 2px; transition: width .4s ease; }

  .adm-row {
    display: grid; align-items: center;
    padding: .85rem 1.5rem; border-bottom: 1px solid var(--border);
    transition: background .12s;
    gap: 1rem;
  }
  .adm-row:last-child { border-bottom: none; }
  .adm-row:hover { background: #faf9f7; }

  .adm-expand-btn {
    display: inline-flex; align-items: center; gap: .3rem;
    font-size: .7rem; font-family: var(--mono); color: var(--muted);
    background: none; border: 1px solid var(--border); border-radius: 6px;
    padding: .25rem .6rem; cursor: pointer; transition: all .15s;
    white-space: nowrap;
  }
  .adm-expand-btn:hover { border-color: var(--border2); color: var(--text); background: var(--bg); }

  .adm-detail-panel {
    background: var(--bg); border-top: 1px solid var(--border);
    padding: 1rem 1.5rem; animation: adm-slide .15s ease;
  }
  @keyframes adm-slide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }

  .adm-hostel-grid { grid-template-columns: 1fr auto auto 90px auto; }

  .adm-floor-table { width: 100%; border-collapse: collapse; font-size: .75rem; }
  .adm-floor-table th { text-align: left; padding: .4rem .6rem; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--border); }
  .adm-floor-table td { padding: .45rem .6rem; border-bottom: 1px solid var(--border); }
  .adm-floor-table tr:last-child td { border-bottom: none; }
  .adm-floor-table tr:hover td { background: rgba(0,0,0,.02); }

  .adm-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 60vh; gap: .75rem; color: var(--muted); font-size: .85rem;
  }
  .adm-spinner {
    width: 20px; height: 20px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: adm-spin .7s linear infinite;
  }
  @keyframes adm-spin { to { transform: rotate(360deg) } }

  .adm-error { text-align: center; padding: 3rem; color: var(--warn); font-size: .85rem; }

  .adm-divider { font-size: .68rem; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); margin: 1.5rem 0 .75rem; }

  .occ-low    { background: var(--accent); }
  .occ-mid    { background: var(--yellow); }
  .occ-high   { background: var(--warn); }

  .adm-text-mono { font-family: var(--mono); }
  .adm-text-muted { color: var(--muted); }
  .adm-text-sm { font-size: .78rem; }
  .adm-text-xs { font-size: .7rem; }

  .adm-show-more {
    display: flex; align-items: center; justify-content: center;
    padding: .75rem; cursor: pointer; font-size: .75rem;
    color: var(--muted); border-top: 1px solid var(--border);
    gap: .3rem; transition: color .15s, background .15s;
  }
  .adm-show-more:hover { color: var(--text); background: var(--bg); }

  .adm-kv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: .6rem; margin-bottom: .75rem; }
  .adm-kv { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: .5rem .75rem; }
  .adm-kv-k { font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  .adm-kv-v { font-size: .95rem; font-weight: 600; font-family: var(--mono); margin-top: .1rem; }

  .adm-counselor-grid {
    grid-template-columns: 1fr 1fr;
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function occClass(pct) {
  if (pct < 60) return "occ-low";
  if (pct < 85) return "occ-mid";
  return "occ-high";
}

function genderBadge(g) {
  const v = g?.toLowerCase();
  if (v === "male")   return <span className="adm-badge adm-badge-blue">Male</span>;
  if (v === "female") return <span className="adm-badge adm-badge-red" style={{color:"#be185d",background:"#fce7f3"}}>Female</span>;
  return <span className="adm-badge adm-badge-gray">{g ?? "—"}</span>;
}

function statusBadge(s) {
  const v = s?.toLowerCase();
  if (v === "active")   return <span className="adm-badge adm-badge-green">Active</span>;
  if (v === "inactive") return <span className="adm-badge adm-badge-red">Inactive</span>;
  return <span className="adm-badge adm-badge-gray">{s ?? "—"}</span>;
}

// ─── Sub‑components ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="adm-card adm-stat">
      <div className="adm-stat-icon">
        <Icon d={ICONS[icon] || ICONS.dot} size={18} />
      </div>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value" style={accent ? { color: accent } : {}}>
        {value ?? "—"}
      </div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

function HostelRow({ hostel }) {
  const [open, setOpen] = useState(false);
  const pct = hostel.occupancyPct ?? 0;

  return (
    <>
      <div className="adm-row adm-hostel-grid">
        <div>
          <div className="adm-text-sm" style={{ fontWeight: 500 }}>{hostel.hostelName}</div>
          <div style={{ marginTop: ".2rem", display: "flex", gap: ".4rem", alignItems: "center" }}>
            {genderBadge(hostel.gender)}
            {statusBadge(hostel.status)}
          </div>
        </div>

        <div className="adm-text-mono adm-text-sm adm-text-muted" style={{ textAlign: "right" }}>
          {hostel.roomCount} <span style={{ fontSize: ".65rem" }}>rooms</span>
        </div>

        <div className="adm-text-mono adm-text-sm" style={{ textAlign: "right" }}>
          {hostel.occupiedBeds}/{hostel.capacity}
        </div>

        <div>
          <div className="adm-progress">
            <div
              className={`adm-progress-fill ${occClass(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="adm-text-xs adm-text-muted adm-text-mono" style={{ marginTop: ".2rem", textAlign: "right" }}>
            {pct}%
          </div>
        </div>

        <button className="adm-expand-btn" onClick={() => setOpen(o => !o)}>
          <Icon d={open ? ICONS.chevronD : ICONS.chevron} size={12} />
          {open ? "Hide" : "Floors"}
        </button>
      </div>

      {open && (
        <div className="adm-detail-panel">
          <div className="adm-kv-grid">
            <div className="adm-kv">
              <div className="adm-kv-k">Available</div>
              <div className="adm-kv-v" style={{ color: "var(--accent)" }}>{hostel.availableBeds}</div>
            </div>
            <div className="adm-kv">
              <div className="adm-kv-k">Floors</div>
              <div className="adm-kv-v">{hostel.numberOfFloor ?? hostel.floors?.length ?? "—"}</div>
            </div>
            <div className="adm-kv">
              <div className="adm-kv-k">Occupancy</div>
              <div className="adm-kv-v">{pct}%</div>
            </div>
          </div>

          {hostel.floors?.length > 0 ? (
            <table className="adm-floor-table">
              <thead>
                <tr>
                  <th>Floor</th>
                  <th>Year</th>
                  <th>Rooms</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {hostel.floors.map((f, i) => (
                  <tr key={i}>
                    <td className="adm-text-mono">F{f.floor}</td>
                    <td>{f.studentYear ?? "—"}</td>
                    <td className="adm-text-mono">{f.roomCount}</td>
                    <td className="adm-text-mono">{f.capacity}</td>
                    <td className="adm-text-mono">{f.occupiedBeds}</td>
                    <td className="adm-text-mono" style={{ color: "var(--accent)" }}>{f.availableBeds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="adm-text-xs adm-text-muted">No floor data available.</div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const DEFAULT_HOSTEL_LIMIT = 5;

export default function AdminReportsDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [showAllHostels, setShowAllHostels] = useState(false);
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    // Fetch reports
    fetch("/api/admin/reports")
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(json.message || "Failed to load");
      })
      .catch(() => setError("Network error — could not reach server"))
      .finally(() => setLoading(false));

    // Fetch counselors
    fetch("/api/admin/counselor")
      .then(r => r.json())
      .then(json => {
        if (json.counselors) setCounselors(json.counselors);
        else if (json.error) console.error("Counselor fetch error:", json.error);
      })
      .catch(err => console.error("Counselor fetch failed:", err));
  }, []);

  const students      = data?.students;
  const hostels       = data?.hostels ?? [];

  const visibleHostels = showAllHostels ? hostels : hostels.slice(0, DEFAULT_HOSTEL_LIMIT);
  const totalBeds      = hostels.reduce((s, h) => s + h.capacity, 0);
  const occupiedBeds   = hostels.reduce((s, h) => s + h.occupiedBeds, 0);
  const overallOcc     = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-root">

        {loading && (
          <div className="adm-loading">
            <div className="adm-spinner" />
            Loading reports…
          </div>
        )}

        {error && !loading && (
          <div className="adm-error">
            <Icon d={ICONS.info} size={20} />
            <div style={{ marginTop: ".5rem" }}>{error}</div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Header */}
            <div className="adm-header">
              <h1 className="adm-title">Reports</h1>
              <p className="adm-sub">hostel management · admin dashboard</p>
            </div>

            {/* ── Student stats ── */}
            <div className="adm-divider">Students</div>
            <div className="adm-grid-4">
              <StatCard label="Total Students" value={students?.total} icon="users"
                sub={`${students?.active} active · ${students?.inactive} inactive`} />
              <StatCard label="Male" value={students?.male} icon="male"
                accent="var(--info)" sub="students registered" />
              <StatCard label="Female" value={students?.female} icon="users"
                accent="#be185d" sub="students registered" />
              <StatCard label="Overall Occupancy" value={`${overallOcc}%`} icon="chart"
                accent={overallOcc >= 85 ? "var(--warn)" : overallOcc >= 60 ? "var(--yellow)" : "var(--accent)"}
                sub={`${occupiedBeds} / ${totalBeds} beds`} />
            </div>

            {/* ── Counselors ── */}
            <div className="adm-divider">Counselors</div>
            <div className="adm-grid-1">
              <div className="adm-card">
                <div className="adm-sect-head">
                  <span className="adm-sect-title">Counselors</span>
                  <span className="adm-sect-count">{counselors.length} assigned</span>
                </div>
                <div>
                  {counselors.length === 0 ? (
                    <div className="adm-card-pad adm-text-muted adm-text-sm">
                      No counselors assigned yet.
                    </div>
                  ) : (
                    <>
                      <div className="adm-row adm-counselor-grid" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border2)", fontWeight: 500, fontSize: ".7rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: ".08em" }}>
                        <span>Counselor</span>
                        <span style={{ textAlign: "right" }}>Hostel</span>
                      </div>
                      {counselors.map((c, i) => (
                        <div
                          key={c.user?.id || i}
                          className="adm-row adm-counselor-grid"
                          style={{
                            padding: ".7rem 1.5rem",
                            borderBottom: i < counselors.length - 1 ? "1px solid var(--border)" : "none"
                          }}
                        >
                          <div>
                            <div className="adm-text-sm" style={{ fontWeight: 500 }}>
                              {c.user?.name || "—"}
                            </div>
                            <div className="adm-text-xs adm-text-muted">
                              #{c.user?.studentNumber || "—"}
                            </div>
                          </div>
                          <div className="adm-text-sm" style={{ textAlign: "right" }}>
                            {c.hostel?.hostelName || "—"}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Hostel detail table ── */}
            <div className="adm-divider">Hostels</div>
            <div className="adm-card" style={{ marginBottom: "1.5rem" }}>
              <div className="adm-sect-head">
                <span className="adm-sect-title">Hostel Details</span>
                <span className="adm-sect-count">{hostels.length} total</span>
              </div>

              <div className="adm-row adm-hostel-grid" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border2)" }}>
                <span className="adm-text-xs adm-text-muted" style={{ textTransform: "uppercase", letterSpacing: ".08em" }}>Name</span>
                <span className="adm-text-xs adm-text-muted" style={{ textTransform: "uppercase", letterSpacing: ".08em", textAlign: "right" }}>Rooms</span>
                <span className="adm-text-xs adm-text-muted" style={{ textTransform: "uppercase", letterSpacing: ".08em", textAlign: "right" }}>Beds</span>
                <span className="adm-text-xs adm-text-muted" style={{ textTransform: "uppercase", letterSpacing: ".08em" }}>Occupancy</span>
                <span />
              </div>

              {visibleHostels.map((h, i) => <HostelRow key={h.id ?? i} hostel={h} />)}

              {hostels.length > DEFAULT_HOSTEL_LIMIT && (
                <div className="adm-show-more" onClick={() => setShowAllHostels(o => !o)}>
                  <Icon d={showAllHostels ? ICONS.chevronD : ICONS.chevron} size={13} />
                  {showAllHostels
                    ? "Show less"
                    : `Show ${hostels.length - DEFAULT_HOSTEL_LIMIT} more hostels`}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </>
  );
}