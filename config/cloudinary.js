const cloudinary = require("cloudinary").v2;
require("dotenv").config();
// Configuration
cloudinary.config({
  cloud_name: "dhbucitr2",
  secure: true,

  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

console.log(cloudinary.config());
