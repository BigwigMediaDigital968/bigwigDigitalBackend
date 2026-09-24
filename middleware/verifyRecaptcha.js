// Verifies a Google reCAPTCHA v3 token sent as `recaptchaToken` in the body.
const MIN_SCORE = 0.5;

const verifyRecaptcha = async (req, res, next) => {
  const token = req.body?.recaptchaToken;

  if (!token) {
    return res.status(400).json({ message: "Captcha verification failed." });
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: req.ip,
        }),
      },
    );
    const result = await response.json();

    if (!result.success || result.score < MIN_SCORE) {
      return res
        .status(400)
        .json({ message: "Captcha verification failed. Please try again." });
    }

    next();
  } catch (err) {
    console.error("reCAPTCHA verify error:", err);
    res.status(500).json({ message: "Could not verify captcha." });
  }
};

module.exports = verifyRecaptcha;
