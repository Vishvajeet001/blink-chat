import router from "express";
import User from "../models/user.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cloudinary from "../cloudinary.js";

const userRouter = router.Router();

userRouter.get("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.send({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).send({
      message: "User info retrieved successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

userRouter.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } });
    res.status(200).send({
      message: "All users retrieved successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

userRouter.post("/upload-profile-pic", authMiddleware, async (req, res) => {
  try {
    const image = req.body.image;

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "blink-chat/profile-pics",
    });

    if (!uploadResponse) {
      return res.send({
        message: "Image upload failed",
        success: false,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );
    res.status(200).send({
      message: "Profile picture updated successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

export default userRouter;
