
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  Wind,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
const API_URL =import.meta.env.VITE_BASE_URL ;
const formatNumber = (value, digits = 0) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("en-GB", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
const formatDate = (value) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
function MetricCard({ title, value, unit, icon: Icon, description, tone }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <span className={`metric-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      <p className="metric-description">{description}</p>
    </article>
  );
}
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/compare-wind`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `API returned ${response.status}. ${message.slice(0, 180)}`
        );
      }
      const result = await response.json();
      if (!Array.isArray(result.comparison)) {
        throw new Error("The API response does not contain comparison data.");
      }
      setData(result);
    } catch (err) {
      setError(
        `${err.message}. Check that the FastAPI backend is running and CORS is configured.`
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);
  const records = data?.comparison ?? [];
  const chartData = useMemo(() => {
    const sampled = records.filter((_, index) => index % 6 === 0);
    const last = records[records.length - 1];
    if (last && sampled[sampled.length - 1] !== last) {
      sampled.push(last);
    }
    return sampled.map((row) => ({
      ...row,
      timeLabel: new Date(row.start_time).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
    }));
  }, [records]);
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((row) =>
      [
        row.start_time,
        row.forecast_publish_time,
        row.forecast_mw,
        row.actual_mw,
        row.error_mw,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [records, search]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  function downloadCsv() {
    if (!records.length) return;
    const columns = [
      "start_time",
      "forecast_publish_time",
      "forecast_mw",
      "actual_mw",
      "error_mw",
      "absolute_error_mw",
    ];
    const escapeCsv = (value) =>`"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      columns.join(","),
      ...records.map((row) =>
        columns.map((column) => escapeCsv(row[column])).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wind-forecast-comparison-january-2026.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  const metrics = data?.metrics ?? {};
  const bias = metrics.bias_mw;
  const positiveBias = bias != null && bias > 0;
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Wind size={23} />
          </div>
          <div>
            <strong>WIND<span>WISE</span></strong>
            <small>ENERGY INTELLIGENCE</small>
          </div>
        </div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <div className="nav-item active">
          <Activity size={18} />
          <span>Forecast overview</span>
        </div>
        <div className="nav-item">
          <Zap size={18} />
          <span>Forecast accuracy</span>
        </div>
        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Data connection</strong>
            <small>{loading ? "Connecting…" : error ? "Needs attention" : "API connected"}</small>
          </div>
        </div>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Analytics <span>/</span> Wind generation</div>
          <div className="topbar-right">
            <span className="period-pill"><span /> JAN 2026</span>
            <button className="icon-button" onClick={loadData} disabled={loading} aria-label="Refresh data">
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>
        <div className="page-heading">
          <div>
            <div className="eyebrow">RENEWABLES / PERFORMANCE MONITORING</div>
            <h1>Wind forecast overview</h1>
            <p className="page-subtitle">
              Compare predicted wind generation against metered outcomes.
            </p>
          </div>
          <button className="primary-button" onClick={downloadCsv} disabled={!records.length}>
            <Download size={17} />
            Export data
          </button>
        </div>
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Unable to load wind data</strong>
              <p>{error}</p>
            </div>
            <button onClick={loadData}>Retry</button>
          </div>
        )}

        {loading && !data ? (
          <div className="loading-panel">
            <RefreshCw className="spin" size={25} />
            <strong>Loading January wind data…</strong>
            <span>Fetching actuals and forecast accuracy from the backend.</span>
          </div>
        ) : (
          <>
            <section className="metrics-grid">
              <MetricCard
                title="Mean absolute error"
                value={formatNumber(metrics.mae_mw)}
                unit="MW"
                icon={Activity}
                tone="mint"
                description="Average absolute forecast difference"
              />
              <MetricCard
                title="Root mean square error"
                value={formatNumber(metrics.rmse_mw)}
                unit="MW"
                icon={Zap}
                tone="violet"
                description="Penalises larger forecast misses"
              />
              <MetricCard
                title="Forecast bias"
                value={formatNumber(metrics.bias_mw, 1)}
                unit="MW"
                icon={positiveBias ? ArrowUpRight : ArrowDownRight}
                tone="amber"
                description={positiveBias ? "Forecasts higher than actuals on average" : "Signed average forecast error"}
              />
              <MetricCard
                title="Matched periods"
                value={formatNumber(data?.matched_records)}
                unit="/ 744"
                icon={CheckCircle2}
                tone="blue"
                description="Hourly forecast and actual pairs"
              />
            </section>
            <section className="chart-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">GENERATION PROFILE</div>
                  <h2>Forecast vs actual</h2>
                  <p>Hourly wind generation, January 2026 · UTC</p>
                </div>
                <div className="chart-legend">
                  <span><i className="legend-forecast" /> Forecast</span>
                  <span><i className="legend-actual" /> Actual</span>
                </div>
              </div>
              {chartData.length ? (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid stroke="#e8edf2" strokeDasharray="4 5" vertical={false} />
                      <XAxis
                        dataKey="timeLabel"
                        tick={{ fill: "#8491a2", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fill: "#8491a2", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={65}
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      />
                      <Tooltip
                        labelFormatter={(label) => `${label} 2026`}
                        formatter={(value, name) => [
                          `${formatNumber(value, 1)} MW`,
                          name === "forecast_mw" ? "Forecast" : "Actual",
                        ]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e5eaf0",
                          boxShadow: "0 8px 28px #10223b12",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast_mw"
                        name="forecast_mw"
                        stroke="#13a879"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual_mw"
                        name="actual_mw"
                        stroke="#5276dc"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-chart">No matched observations are available to plot.</div>
              )}

              <div className="chart-footer">
                <span><span className="footer-dot green" /> Forecast values</span>
                <span><span className="footer-dot blue" /> Actual generation</span>
                <span className="chart-note">Chart displays a sample of hourly points for readability.</span>
              </div>
            </section>
            <section className="table-card">
              <div className="section-heading table-heading">
                <div>
                  <div className="eyebrow">OBSERVATION DETAIL</div>
                  <h2>Hourly comparison</h2>
                  <p>{formatNumber(filteredRecords.length)} records · Generation in MW</p>
                </div>
                <label className="search-box">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search records..."
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Delivery time (UTC)</th>
                      <th>Forecast published (UTC)</th>
                      <th>Forecast (MW)</th>
                      <th>Actual (MW)</th>
                      <th>Error (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={`${row.start_time}-${row.forecast_publish_time}`}>
                        <td className="time-cell"><Clock3 size={14} />{formatDate(row.start_time)}</td>
                        <td>{formatDate(row.forecast_publish_time)}</td>
                        <td>{formatNumber(row.forecast_mw, 1)}</td>
                        <td>{formatNumber(row.actual_mw, 1)}</td>
                        <td>
                          <span className={`error-value ${row.error_mw > 0 ? "error-positive" : row.error_mw < 0 ? "error-negative" : ""}`}>
                            {row.error_mw > 0 ? "+" : ""}{formatNumber(row.error_mw, 1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!visibleRows.length && (
                      <tr><td colSpan="5" className="no-results">No matching records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <span>
                  Showing {filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
                </span>
                <div>
                  <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>Previous</button>
                  <span className="page-count">{currentPage} / {pageCount}</span>
                  <button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage >= pageCount}>Next</button>
                </div>
              </div>
            </section>
            <div className="assumption-note">
              <AlertCircle size={18} />
              <div>
                <strong>Decision-time assumption</strong>
                <p>
                  Forecasts are selected using a cutoff of 12:00 UTC on the
                  previous calendar day. This is an analytical assumption, not
                  a confirmed purchasing rule. Positive error means forecast
                  generation exceeded actual generation.
                </p>
              </div>
            </div>
          </>
        )}
        <footer className="page-footer">
          <span>WINDWISE · WIND GENERATION ANALYTICS</span>
          <span>Source: Elexon BMRS · January 2026</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
