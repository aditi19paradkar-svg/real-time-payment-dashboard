"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

type Metrics = {
  totalVolume: number;
  successRate: string;
  averageAmount: number;
  peakHour: number | null;
  topPaymentMethod: string | null;
};

type PaymentEvent = {
  type: string;
  payment: {
    _id: string;
    tenantId: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  };
  timestamp: string;
};
 
  export default function Home() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [livePayments, setLivePayments] = useState<PaymentEvent[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchMetrics = () => {
  fetch("http://localhost:4000/api/analytics/metrics")
    .then((res) => res.json())
    .then((data) => {
      console.log("Updated metrics:", data);
      setMetrics(data);
    });
  };

    const fetchTrends = () => {
    fetch("http://localhost:4000/api/analytics/trends?period=day")
    .then((res) => res.json())
    .then((data) => {
      setTrendData(data);
    })
    .catch((err) => console.error(err));
  };

    useEffect(() => {
    fetchMetrics();
    fetchTrends();

    let socket: WebSocket;
    let reconnectTimeout: any;

    //const socket = new WebSocket("ws://localhost:8080");
    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => {
        setConnected(true);
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data: PaymentEvent = JSON.parse(event.data);
        //setLivePayments((prev) => [data, ...prev.slice(0, 9)]);
        setLivePayments((prev) => {
          const updated = [data, ...prev];
          return updated.slice(0, 50); // keep 50 max
        });
        
        // Delay metrics refresh slightly
        setTimeout(() => {
          fetchMetrics();
          fetchTrends();
        }, 300);
      };

      socket.onclose = () => {
        setConnected(false);
        console.log("WebSocket disconnected. Reconnecting...");

        reconnectTimeout = setTimeout(() => {
          connectWebSocket();
        }, 2000);  
      };

      socket.onerror = () => {
        socket.close();
      };

    }

    connectWebSocket();
    return () => {
      socket?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💳 Payment Analytics Dashboard</h1>

      <p style={{ marginBottom: 20 }}>
        Status:{" "}
        <span style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>

      {/* Metrics Cards */}
      <div style={styles.metricsGrid}>
        <Card title="Total Volume" value={`₹${metrics?.totalVolume?.toLocaleString() ?? 0}`} />
        <Card title="Success Rate" value={`${metrics?.successRate ?? 0}%`} />
        <Card title="Average Amount" value={`₹${metrics?.averageAmount?.toLocaleString() ?? 0}`} />
        <Card title="Peak Hour" value={metrics?.peakHour ?? "-"} />
        <Card title="Top Method" value={metrics?.topPaymentMethod ?? "-"} />
      </div>

      {/*Payment Trends (Today) */}
      <h2 style={{ marginTop: 40 }}>📈 Payment Trends (Today)</h2>
      
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live Payments */}
      <div style={styles.liveSection}>
        <h2>⚡ Live Payments</h2>

        {livePayments.length === 0 ? (
          <p>No live payments yet...</p>
        ) : (
          <div style={styles.liveList}>
            {livePayments.slice(0, visibleCount).map((event, index) => (
              <div key={index} style={styles.paymentCard}>
                <div>
                  {/*<strong>₹{event.payment.amount}</strong>*/}
                  <strong style={{ color: "#000" }}>
                    ₹{event.payment.amount}
                  </strong>
                  <p>{event.payment.method}</p>
                </div>
                <div>
                  {/*<span>{event.type}</span> */}
                  <span
                    style={{
                      color:
                        event.type === "payment_received"
                          ? "green"
                          : event.type === "payment_failed"
                          ? "red"
                          : "orange",
                      fontWeight: "bold"
                    }}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setVisibleCount((prev) => prev + 10)}
                style={{
          marginTop: 15,
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer"
        }}>
              Load More
        </button>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p style={{ fontSize: 14, color: "#6b7280" }}>{title}</p>
      <h2 style={{ color: "#111827" }}>{value}</h2>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 40,
    fontFamily: "Arial, sans-serif",
    /*backgroundColor: "#f5f6fa",*/
    background: "linear-gradient(to right, #eef2ff, #f8fafc)",
    minHeight: "100vh",
    color: "#000"
  },
  title: {
    marginBottom: 30
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 40
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  cardTitle: {
    fontSize: 14,
    color: "#555"
  },
  liveSection: {
    marginTop: 20
  },
  liveList: {
    display: "flex",
    flexDirection: "column",
    gap: 15
  },
  paymentCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  }
};