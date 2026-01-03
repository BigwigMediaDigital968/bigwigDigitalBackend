const sendEmail = require("../utils/sendEmail");
const Application = require("../modals/application.model");

exports.submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      experience,
      cctc,
      ectc,
      noticePeriod,
      coverLetter,
    } = req.body;

    const resume = req.file;

    if (!resume) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // Compose HTML email content
    const html = `
      <h2>New Job Application</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobileNumber}</p>
      <p><strong>Experience:</strong> ${experience}</p>
      <p><strong>Current CTC:</strong> ${cctc}</p>
      <p><strong>Expected CTC:</strong> ${ectc}</p>
      <p><strong>Notice Period:</strong> ${noticePeriod}</p>
      <p><strong>Cover Letter:</strong> ${coverLetter}</p>
    `;

    // Send email with attachment
    await sendEmail({
      to: "hsinghkhalsa980@gmail.com", // 🔁 Replace with actual HR email
      subject: "New Job Application - " + fullName,
      text: `New application received from ${fullName}.`,
      html,
      attachments: [
        {
          filename: resume.originalname,
          path: resume.path, // 🟢 Local path of uploaded resume
        },
      ],
    });

    res.status(200).json({ message: "Application sent to HR successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to send application", error: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch applications", error: err.message });
  }
};
