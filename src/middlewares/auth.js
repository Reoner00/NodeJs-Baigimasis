import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Please provide a token." });
  }

  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = authHeader;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "You have provided an invalid token.",
      });
    }

    req.user = { userId: decoded.userId || decoded.id };
    next();
  });
};
