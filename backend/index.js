const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("./db");
require("./websocket");

const app = express();

app.use(cors());
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

app.use("/api", limiter);
app.use(express.json());
//code for logging every request and showing performance timing
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

const analyticsRoutes = require("./routes/analytics");
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Payment Analytics Backend Running");
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});


const { broadcastPayment } = require("./websocket");
const Payment = require("./models/payment");
app.get("/seed", async (req, res) => {
  const p = await Payment.create({
    tenantId: "tenant_1",
    amount: 500,
    method: "UPI",
    status: "success"
  });

  res.json(p);
})

setInterval(async () => {
  const payment = await Payment.create({
    tenantId: "tenant_1",
    amount: Math.floor(Math.random() * 1000),
    method: "UPI",
    status: "success"
  });

  broadcastPayment(payment);
}, 5000);

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit();
});