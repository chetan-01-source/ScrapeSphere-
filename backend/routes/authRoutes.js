const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const authenticate = require("../controllers/authenticate");

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.send("This is a protected route!");
});

module.exports = router;
