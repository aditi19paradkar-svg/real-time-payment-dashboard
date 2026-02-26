const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", () => {
  console.log("WebSocket client connected");

  wss.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  wss.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log("WebSocket server started on port 8080");

function broadcastPayment(payment) {

    const eventType =
      payment.status === "success"
      ? "Payment recieved" 
      : payment.status === "failed"
      ? "Payment Failed" 
      : "Payment Refunded";

  const event = {
    type: eventType,
    payment: payment,
    timestamp: new Date()
  };

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });

}

module.exports = { broadcastPayment };