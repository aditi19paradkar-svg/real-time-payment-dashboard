
const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");
module.exports = router;

// GET /api/analytics/metrics
/*router.get("/metrics", async (req, res) => {
  console.log("Metrics API hit");
  //console.log(res);
  res.json({ message: "Metrics API working" });

});*/



router.get("/metrics", async (req, res) => {
  try {
    const tenantId = req.query.tenantId;
    const filter = tenantId ? { tenantId } : {};
    const totalPayments = await Payment.countDocuments(filter);
    const successfulPayments = await Payment.countDocuments({ 
      ... filter, 
      status: "success" });

    const totalVolumeAgg = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const averageAmountAgg = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: "$amount" } } }
    ]);

    const topMethodAgg = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: "$method", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const peakHourAgg = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    res.json({
      totalVolume: totalVolumeAgg[0]?.total || 0,
      successRate: totalPayments
        ? ((successfulPayments / totalPayments) * 100).toFixed(2)
        : 0,
      averageAmount: averageAmountAgg[0]?.avg || 0,
      peakHour: peakHourAgg[0]?._id || null,
      topPaymentMethod: topMethodAgg[0]?._id || null
    });

    const count = await Payment.countDocuments();
    //console.log("Total payments in DB:", count);

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch metrics",
      error: error.message });
  }

});

// GET /api/analytics/trends
  router.get("/trends", async (req, res) => {
  //res.json({ message: "Trends API working" });

  try {
    const period = req.query.period || "day";

    let groupBy;

    if (period === "day") {
      groupBy = { $hour: "$createdAt" };
    } else if (period === "week") {
      groupBy = { $dayOfMonth: "$createdAt" };
    } else {
      groupBy = { $month: "$createdAt" };
    }

    const trends = await Payment.aggregate([
      {
        $group: {
          _id: groupBy,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "success"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = trends.map(t => ({
      timestamp: t._id,
      amount: t.amount,
      count: t.count,
      successRate: ((t.successCount / t.count) * 100).toFixed(2)
    }));

    res.json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch metrics",
      error: error.message
     });
  }
  });

