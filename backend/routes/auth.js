const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

router.post('/login', async (req, res) => {
  try {
    const { email, code } = req.body;
    const settings = await Settings.findOne();

    if (!settings) return res.status(500).json({ message: 'Settings not initialized' });

    const normalizedEmail = email.trim().toLowerCase();
    const isApproved = settings.approvedEmails.some(e => e.toLowerCase() === normalizedEmail);

    if (!isApproved) {
      return res.status(403).json({ message: "Email not on the approved team list." });
    }

    if (code !== settings.accessCode) {
      return res.status(401).json({ message: "Incorrect access code." });
    }

    // Pass back basic user info (admin status can be derived on frontend or passed here)
    res.json({ message: "Login successful", email: normalizedEmail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;