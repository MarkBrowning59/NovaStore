// src/RequestsPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

const API_URL = "https://sync.novabpc.com:443/GetRequests?storeNumber=";
// const API_URL = "http://localhost:51044/GetRequests?storeNumber=";

// Helper for query params
function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

export default function RequestsPage() {
  const params = useParams();
  const query = useQuery();

  // Store number from /requests/:storeNumber
  const storeFromPath = params.storeNumber
    ? Number(params.storeNumber)
    : undefined;

  // Store number from /requests?storeNumber=123
  const storeFromQuery = query.get("storeNumber")
    ? Number(query.get("storeNumber"))
    : undefined;

  // Final store number priority: path > query > default (1)
  const effectiveStoreNumber = storeFromPath || storeFromQuery || 1;

  const [storeNumber, setStoreNumber] = useState(effectiveStoreNumber);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async (num) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL + num);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Whenever the URL-driven store number changes, sync state & fetch
  useEffect(() => {
    setStoreNumber(effectiveStoreNumber);
    fetchRequests(effectiveStoreNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStoreNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(storeNumber) || 0;
    if (num > 0) {
      fetchRequests(num);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  // --- CSV EXPORT HELPERS ---

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCsv = () => {
    if (!requests.length) return;

    // Collect all option keys dynamically across all requests
    const allOptionKeys = new Set();
    for (const item of requests) {
      const opt = item.request?.option || {};
      Object.keys(opt).forEach((k) => allOptionKeys.add(k));
    }
    const optionKeys = Array.from(allOptionKeys);

    const headers = [
      "StoreNumber",
      "Email",
      "PostedDate",
      ...optionKeys.map((k) => `Option_${k}`),
      "Shipping_fullname",
      "Shipping_email",
      "Shipping_manager",
      "Shipping_address1",
      "Shipping_address2",
      "Shipping_city",
      "Shipping_state",
      "Shipping_zip",
    ];

    const rows = [];
    rows.push(headers.map(escapeCsvValue).join(","));

    for (const item of requests) {
      const opt = item.request?.option || {};
      const ship = item.request?.shippingInformation || {};

      const row = [
        item.storeNumber,
        item.email,
        item.postedDate,
        ...optionKeys.map((key) => opt[key] ?? ""),
        ship.fullname ?? "",
        ship.email ?? "",
        ship.phone ?? "",
        ship.address1 ?? "",
        ship.address2 ?? "",
        ship.city ?? "",
        ship.state ?? "",
        ship.zip ?? "",
      ];

      rows.push(row.map(escapeCsvValue).join(","));
    }

    const csvContent = rows.join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requests_store_${storeNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <h1>100 Years of W. R. Meadows <br/> Promotional Option Requests</h1>

      {/* Store selector + CSV */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* <label>
          Store #
          <input
            type="number"
            value={storeNumber}
            onChange={(e) => setStoreNumber(e.target.value)}
            style={{ width: "80px", marginLeft: "0.5rem" }}
          />
        </label>
        <button type="submit">Load</button> */}

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!requests.length}
          style={{ marginLeft: "auto" }}
        >
          Export CSV
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requests.length === 0 && !loading && !error && (
        <p>No requests found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {requests.map((item, index) => {
          const opt = item.request?.option || {};
          const ship = item.request?.shippingInformation || {};
          const optionEntries = Object.entries(opt);

          return (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "1rem",
              }}
            >
              {/* <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <strong>Store #{item.storeNumber}</strong>
                <span>{formatDate(item.postedDate)}</span>
              </div> */}

              {/* Dynamic option section */}
              <div style={{ marginBottom: "0.5rem" }}>
                <h3 style={{ marginBottom: "0.25rem" }}>Option</h3>

                {optionEntries.length === 0 && <div>No option data.</div>}

                {optionEntries.length > 0 && (
                  <table style={{ borderCollapse: "collapse" }}>
                    <tbody>
                      {optionEntries.map(([key, value]) => {
                        const displayValue =
                          value !== null && typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value ?? "");

                        const label = key
                          .replace(/_/g, " ")
                          .replace(/([a-z])([A-Z])/g, "$1 $2")
                          .replace(/^\w/, (c) => c.toUpperCase());

                        return (
                          <tr key={key}>
                            <td
                              style={{
                                padding: "2px 8px 2px 0",
                                fontWeight: "bold",
                                verticalAlign: "top",
                              }}
                            >
                              {label}:
                            </td>
                            <td style={{ padding: "2px 0" }}>{displayValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Shipping section */}
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>Shipping</h3>
                <div>
                  <strong>Name:</strong> {ship.fullname}
                </div>
                <div>
                  <strong>Email:</strong> {ship.email}
                </div>
                <div>
                  <strong>Phone:</strong> {ship.phone}
                </div>
                <div>
                  <strong>Address:</strong>{" "}
                  {ship.address1}
                  {ship.address2 ? `, ${ship.address2}` : ""},{" "}
                  {ship.city}, {ship.state} {ship.zip}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
