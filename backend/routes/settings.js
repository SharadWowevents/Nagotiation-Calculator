const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings (adds/removes emails, updates code)
router.put('/', async (req, res) => {
  try {
    const updatedData = req.body;
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.accessCode = updatedData.accessCode || settings.accessCode;
      settings.approvedEmails = updatedData.approvedEmails || settings.approvedEmails;
      settings.admins = updatedData.admins || settings.admins;
      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;