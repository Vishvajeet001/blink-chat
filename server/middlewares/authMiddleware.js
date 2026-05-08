import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).send({
        message: "Access token missing",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.body = req.body || {};
    req.body.id = decoded.id;
    next();
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

export default authMiddleware;
