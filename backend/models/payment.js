const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  tenantId: String,
  amount: Number,
  method: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

// 🔥 Add these indexes
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ method: 1 });

module.exports = mongoose.model("Payment", paymentSchema);