const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/upload");
const verifyToken = require("../Middlewares/Auth");
const userController = require("../Controllers/userController");


router.post("/change-password", verifyToken, userController.changePassword);
router.post("/upload-image", verifyToken, upload.single("image"), userController.uploadImage);
router.get("/me", verifyToken, userController.getCurrentUser);
module.exports = router;
