import jwt from "jsonwebtoken";

export async function validateToken(req, res, next) {
  try {
    let token;
    let authHeader = req.headers.authorization; 
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).json({ error: "User is not authorized" });
          return; 
        }
        req.user = decoded.user;
        next();
      });
  
      if (!token) {
        res.status(401).json({ error: "User is not authorized or token is missing" });
        return;
      }
    } else {
      res.status(401).json({ error: "User is not authorized or token is missing" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
