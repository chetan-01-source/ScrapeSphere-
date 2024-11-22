const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("entered here");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
      
    // Save user
    const newUser = new User({ username, email, password: hashedPassword });
  
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
  
      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      res.status(200).json({ token, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  };
module.exports={
    register,
    login
}
