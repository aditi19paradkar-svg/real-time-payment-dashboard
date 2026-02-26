const mongoose = require("mongoose");

//mongoose.connect("mongodb://127.0.0.1:27017/payments");
mongoose.connect("mongodb://localhost:27017/payments");

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

module.exports = mongoose;