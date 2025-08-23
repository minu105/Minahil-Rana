const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/utils/images
router.get("/images", (req, res) => {
  const dirPath = path.join(__dirname, "../../images");

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Unable to scan images folder" });
    }

    // map to full URLs
    const urls = files.map(file => `${req.protocol}://${req.get("host")}/images/${file}`);
    res.json({ success: true, images: urls });
  });
});

module.exports = router;
