const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstname")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`)
    .escape(),
  body("lastname")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`)
    .escape(),

  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email must not empty")
    .isEmail()
    .withMessage("Enter a valid email")
    .escape(),
  body("email")
    .trim()
    .custom(async (value) => {
      const user = await prisma.user.findFirst({
        where: {
          email: value,
        },
      });
      if (user) {
        throw new Error("E-mail already in use");
      }
    }),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),
  body("confirmpassword")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters")
    .custom((value, { req }) => {
      return value === req.body.confirmpassword;
    }),
];

exports.login_get = (req, res) => {
  res.render("login_form");
};

exports.signup_get = (req, res) => {
  res.render("signup_form");
};

exports.signup_post = [
  validateUser,
  asyncHandler((req, res) => {
    const errors = validationResult(req);

    const { firstname, lastname, email, password, confirmpassword } = req.body;

    if (!errors.isEmpty()) {
      return res.render("signup_form", { errors: errors.array() });
    }

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      await prisma.user.create({
        data: {
          firstName: firstname,
          lastName: lastname,
          email: email,
          password: hashedPassword,
        },
      });
    });

    res.redirect("/log-in");
  }),
];

exports.logout_get = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.locals.currentUser = null;
    res.redirect("/");
  });
});
