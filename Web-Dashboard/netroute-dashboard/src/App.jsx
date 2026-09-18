import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const BACKEND_URL = "http://192.168.137.122:8080";

export default function App() {
  const [servers, setServers] = useState([
    { serverId: "http://192.168.137.122:5001/health", latencyMs: 24.2, packetLossPercent: 0, loadPercent: 45, status: "healthy" },
    { serverId: "http://192.168.137.122:5002/health", latencyMs: 31.8, packetLossPercent: 0, loadPercent: 30, status: "healthy" },
    { serverId: "http://192.168.137.122:5003/health", latencyMs: 220.5, packetLossPercent: 15, loadPercent: 88, status: "down" },
    { serverId: "http://192.168.137.122:5004/health", latencyMs: 31.8, packetLossPercent: 0, loadPercent: 30, status: "healthy" }
  ]);
  const [activeServer, setActiveServer] = useState("http://192.168.137.122:5001/health");
  const [connected, setConnected] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/network-status`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const latestMap = {};
        res.data.forEach((item) => {
          latestMap[item.serverId] = item;
        });
        setServers(Object.values(latestMap));
        setConnected(true);
      }

      const trafficRes = await axios.get(`${BACKEND_URL}/api/traffic/active-server`).catch(() => null);
      if (trafficRes?.data) setActiveServer(trafficRes.data);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const downServers = servers.filter(
    (s) => s.status === "down" || s.latencyMs < 0 || s.packetLossPercent >= 100
  );
  const slowServers = servers.filter(
    (s) => (s.latencyMs > 150 || s.loadPercent > 80) && !downServers.includes(s)
  );
  const hasAlerts = downServers.length > 0 || slowServers.length > 0;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700" }}>NetRoute AI Monitoring Console</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>Real-time server telemetry and routing dashboard</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            height: "10px",
            width: "10px",
            borderRadius: "50%",
            background: connected ? "#22c55e" : "#eab308",
            display: "inline-block"
          }} />
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
            {connected ? "Backend Connected (Live 2s)" : "Showing Preview Data (Backend Offline)"}
          </span>
        </div>
      </header>

      {/* Dynamic Network Alert Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderRadius: "8px",
        marginBottom: "24px",
        background: hasAlerts ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
        border: `1px solid ${hasAlerts ? "#ef4444" : "#22c55e"}`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "14px",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "4px",
            background: hasAlerts ? "#ef4444" : "#22c55e",
            color: "#fff"
          }}>
            {hasAlerts ? "SYSTEM ALERT" : "ALL SYSTEMS NOMINAL"}
          </span>
          <span style={{ fontSize: "14px", color: "#f8fafc" }}>
            {hasAlerts
              ? `${downServers.length} node(s) down, ${slowServers.length} node(s) degraded`
              : "All monitored nodes operating within target latency parameters"}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          Active Nodes: {servers.length}
          </span>
      </div>

      {/* Active Route Indicator */}
      <div style={{ background: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155", marginBottom: "24px" }}>
        <p style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          Currently Active Server Route
        </p>
        <h2 style={{ fontSize: "20px", color: "#38bdf8", marginTop: "4px" }}>{activeServer}</h2>
      </div>

      {/* Health Table */}
      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "16px", color: "#cbd5e1", marginBottom: "12px" }}>Node Health Status</h3>
        <div style={{ overflowX: "auto", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "12px 16px" }}>Server URL</th>
                <th style={{ padding: "12px 16px" }}>Latency (ms)</th>
                <th style={{ padding: "12px 16px" }}>Packet Loss</th>
                <th style={{ padding: "12px 16px" }}>Load</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((s, idx) => {
                const isDown = s.status === "down" || s.latencyMs < 0 || s.packetLossPercent >= 100;
                const isSlow = s.latencyMs > 150;
                const color = isDown ? "#ef4444" : isSlow ? "#f59e0b" : "#22c55e";
                const bg = isDown ? "rgba(239, 68, 68, 0.15)" : isSlow ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)";
                const label = isDown ? "DOWN" : isSlow ? "DEGRADED" : "HEALTHY";

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "500" }}>{s.serverId}</td>
                    <td style={{ padding: "12px 16px" }}>{Number(s.latencyMs).toFixed(1)} ms</td>
                    <td style={{ padding: "12px 16px" }}>{s.packetLossPercent}%</td>
                    <td style={{ padding: "12px 16px" }}>{s.loadPercent}%</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", color, backgroundColor: bg }}>
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Latency Chart */}
      <section style={{ background: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
        <h3 style={{ fontSize: "16px", color: "#cbd5e1", marginBottom: "16px" }}>Latency Telemetry Distribution</h3>
        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={servers} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="serverId" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis unit="ms" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "6px" }} />
              <Line type="monotone" dataKey="latencyMs" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: "#38bdf8" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}