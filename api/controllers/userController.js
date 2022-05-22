const { check, validationResult } = require("express-validator");
const middleware = require("../assets/middleware");
const config = require("../config.json");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.createUser = [
  // Data Validation and sanitation.
  check("username")
    .exists()
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters")
    .toLowerCase()
    // Makes sure the username is not already in use by another member
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        return Promise.reject("Username already exists");
      }
    }),
  check("password")
    .exists()
    .trim()
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    // If no errors, move on to step.
    next();
  },
  async (req, res, next) => {
    try {
      // Hash password provided by user
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        balance: 1000000,
        wallet: [],
      });
      // Save new user, and update my admin account to reflect new friend as well.
      await user.save();

      // Save user in order to provide login details to our endpoint to retrieve authentication token.
      res.locals.user = {
        username: user.username,
        password: req.body.password,
      };
      next();
    } catch (errors) {
      console.log(errors);
      return res
        .status(400)
        .json({ message: "Error creating new account", errors });
    }
  },
  // Make request to our login endpoint to retrieve and send back authentication token.
  async (req, res) => {
    try {
      // Use our login endpoint to send user back a authentication token.
      const {
        data: { token },
      } = await axios.post(`${config.apiUrl}/login`, res.locals.user);

      return res.json({ token });
    } catch (errors) {
      return res
        .status(400)
        .json({ message: "Error retrieving authentication token", errors });
    }
  },
];

exports.getUser = [
  // Verify token exists - if so, pull and save user id in res.locals.userId for next middleware.
  middleware.verifyTokenAndStoreCredentials,
  // Verify token is valid, and retrieve user.
  async (req, res) => {
    try {
      const user = await User.findById(res.locals.userId).select(
        "username fullName portfolio balance"
      );

      if (user == null) {
        return res
          .status(401)
          .json({ message: "Invalid token, no user exists with this token" });
      } else {
        return res.json({ user });
      }
    } catch (errors) {
      return res
        .status(401)
        .json({ message: "Error getting user information", errors });
    }
  },
];

// Allows user to update their fullName, or profilePicture
exports.updateUser = [
  // Verify token exists - if so, pull and save user id in res.locals.userId for next middleware.
  middleware.verifyTokenAndStoreCredentials,
];

exports.deleteUser = (req, res, next) => {
  res.json({ msg: "Get User Endpoint" });
};
