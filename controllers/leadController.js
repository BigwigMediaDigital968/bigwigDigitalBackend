const Lead = require("../modals/Leads.model");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");

const otpMap = new Map(); // In-memory OTP store

// Send OTP
exports.sendOTP = async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // 1️⃣ Check if email already exists in the database
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        message: "Email already exists. Please use another email ID.",
      });
    }

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // 3️⃣ Store OTP temporarily
    otpMap.set(email, {
      otp,
      data: { name, email, phone, message },
      time: Date.now(),
    });

    // 4️⃣ Send OTP email
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

  const { otp: correctOtp, data } = record;
  if (parseInt(otp) !== correctOtp)
    return res.status(400).json({ message: "Invalid OTP." });

  const newLead = new Lead({ ...data, verified: true });
  await newLead.save();

  otpMap.delete(email);

  // 1️⃣ Send confirmation email to the user
  await sendEmail({
    to: email,
    subject: "We've received your query - Bigwig Media Digital",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://www.bigwigdigital.in/assets/bigwig%20digital%20logo%20(11)-T8_kDtlw.png" alt="Bigwig Media Logo" width="120" />
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333;">Hello ${data.name},</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for reaching out to <strong>Bigwig Media Digital</strong>.
            We have received your message and our team will get in touch with you within the next 24-48 hours.
          </p>
          <p style="font-size: 16px; color: #555;">
            Meanwhile, feel free to explore more about our services or reply to this email if you have any additional questions.
          </p>
          <p style="margin-top: 30px; font-size: 15px; color: #777;">
            Regards,<br />
            <strong>Team Bigwig Media Digital</strong><br />
            <a href="https://www.bigwigdigital.in/" style="color: #007BFF;">Bigwig Digital</a>
          </p>
        </div>
      </div>
    `,
  });

  // 2️⃣ Send internal notification to HR
  await sendEmail({
    to: "accounts@bigwigmedia.in", // 🔁 Replace with actual HR email
    subject: "New Lead Captured - Bigwig Media",
    html: `
      <h3>New Lead Details</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong><br /> ${data.message}</p>
    `,
  });

  res
    .status(200)
    .json({ message: "Lead captured, confirmation sent, HR notified." });
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

// PUT /leads/:id/mark
exports.markLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { marked } = req.body; // true or false

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { marked },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({
      message: "Lead marked status updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Error updating mark status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
