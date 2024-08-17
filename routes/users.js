const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");

/* GET users listing. */
router.get("/log-in", usersController.login_get);

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })
);

router.get("/sign-up", usersController.signup_get);

router.post("/sign-up", usersController.signup_post);

router.get("/log-out", usersController.logout_get);

module.exports = router;
