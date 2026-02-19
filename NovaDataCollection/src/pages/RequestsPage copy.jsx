import { useState, useEffect } from "react";



export default function RequestsPage() {
  const [storeNumber, setStoreNumber] = useState(1);
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

  useEffect(() => {
    fetchRequests(storeNumber);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRequests(storeNumber);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // --- CSV EXPORT HELPERS ---

  // Escape commas, quotes, and line breaks for CSV
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

    // Collect all option keys across all items (dynamic)
    const allOptionKeys = new Set();
    for (const item of requests) {
      const opt = item.request?.option || {};
      Object.keys(opt).forEach((k) => allOptionKeys.add(k));
    }
    const optionKeys = Array.from(allOptionKeys);

    // CSV header
    const headers = [
      "StoreNumber",
      "Email",
      "PostedDate",
      // dynamic option headers
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

    // Header row
    rows.push(headers.map(escapeCsvValue).join(","));

    // Data rows
    for (const item of requests) {
      const opt = item.request?.option || {};
      const ship = item.request?.shippingInformation || {};

      const row = [
        item.storeNumber,
        item.email,
        item.postedDate,
        // dynamic option values (in same order as optionKeys)
        ...optionKeys.map((key) => opt[key] ?? ""),
        ship.fullname ?? "",
        ship.email ?? "",
        ship.manager ?? "",
        ship.address1 ?? "",
        ship.address2 ?? "",
        ship.city ?? "",
        ship.state ?? "",
        ship.zip ?? "",
      ];

      rows.push(row.map(escapeCsvValue).join(","));
    }

    const csvContent = rows.join("\r\n");

    // Trigger download in browser
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
      <h1>Promotional Option Requests</h1>

      {/* Store selector + CSV button */}
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
        <label>
          Store #
          <input
            type="number"
            value={storeNumber}
            onChange={(e) => setStoreNumber(e.target.value)}
            style={{ width: "80px", marginLeft: "0.5rem" }}
          />
        </label>
        <button type="submit">Load</button>

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>Store #{item.storeNumber}</strong>
                <span>{formatDate(item.postedDate)}</span>
              </div>

              {/* Dynamic option table */}
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
                <div><strong>Name:</strong> {ship.fullname}</div>
                <div><strong>Email:</strong> {ship.email}</div>
                <div><strong>Manager:</strong> {ship.manager}</div>
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
