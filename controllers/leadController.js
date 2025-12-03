const Lead = require("../modals/Leads.model");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");

const otpMap = new Map(); // In-memory OTP store

// Send OTP
exports.sendOTP = async (req, res) => {
  const { name, email, phone, message, services } = req.body;

  try {
    // Check if email already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        message: "Email already exists. Please use another email ID.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store data + services
    otpMap.set(email, {
      otp,
      data: { name, email, phone, message, services },
      time: Date.now(),
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Your OTP - Bigwig Media",
      html: `<p>Hello ${name},</p><p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

// Verify OTP and save lead
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const record = otpMap.get(email);
  if (!record)
    return res.status(400).json({ message: "OTP expired or not found." });

  const { otp: storedOtp, data } = record;

  if (parseInt(otp) !== storedOtp)
    return res.status(400).json({ message: "Invalid OTP." });

  // Save lead with services
  const newLead = new Lead({ ...data, verified: true });
  await newLead.save();

  otpMap.delete(email);

  // Confirmation email to user
  await sendEmail({
    to: email,
    subject: "We've received your query - Bigwig Media Digital",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Hello ${data.name},</h2>
        <p>Thank you for contacting <strong>Bigwig Media Digital</strong>.</p>
        <p>We will connect with you within 24–48 hours.</p>
      </div>
    `,
  });

  // HR internal notification
  await sendEmail({
    to: "hsinghkhalsa980@gmail.com",
    subject: "New Lead Captured - Bigwig Media",
    html: `
      <h3>New Lead Details</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Selected Services:</strong> ${data.services.join(", ")}</p>
      <p><strong>Message:</strong><br /> ${data.message}</p>
    `,
  });

  res.status(200).json({
    message: "Lead captured, confirmation sent, HR notified.",
  });
};

// Get all leads
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }); // Sort latest first
    res.status(200).json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ message: "Server error while fetching leads." });
  }
};

exports.getLeadsLast10Days = async (req, res) => {
  try {
    const startDate = moment().subtract(9, "days").startOf("day").toDate();

    const leadsByDay = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🧩 Fill missing dates with count 0
    const last10Days = Array.from({ length: 10 }, (_, i) =>
      moment()
        .subtract(9 - i, "days")
        .format("YYYY-MM-DD")
    );

    const result = last10Days.map((date) => {
      const entry = leadsByDay.find((d) => d._id === date);
      return { date, count: entry ? entry.count : 0 };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching 10-day leads:", error);
    res.status(500).json({ message: "Server error fetching lead data." });
  }
};
