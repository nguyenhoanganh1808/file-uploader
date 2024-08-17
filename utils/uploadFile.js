const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.uploadFile = async (file) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: "auto",
  };

  try {
    const result = await cloudinary.uploader.upload(file, options);
    console.log(result);
    fs.unlinkSync(file);
    return cloudinary.url(result.public_id, {
      flags: "attachment",
    }); // Return the URL of the uploaded image
  } catch (error) {
    console.log(error);
    throw new Error("Image upload failed");
  }
};
