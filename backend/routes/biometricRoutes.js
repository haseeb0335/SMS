import crypto from "crypto";
import express from "express";

const router = express.Router();

/* Generate challenge */
router.get("/biometric-challenge", (req, res) => {
  try {
    const challenge = crypto.randomBytes(32).toString("base64");
    res.json({
      challenge: challenge
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Challenge generation failed"
    });
  }
});

/* Verify biometric */
router.post("/biometric-verify", (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "No credential received"
      });
    }

    res.json({
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false
    });
  }
});

// Using named export to match your original export { router }
export { router };