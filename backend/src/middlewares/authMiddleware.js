const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

module.exports = (req, res, next) => {
  // 1. Get the token from the header
  console.log("Middleware is running!");
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 2. format is usually "Bearer <token>", so split by space
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // 4. Attach user info to the request object
    // decoded payload looks like: { userId: 'uuid...', iat: ..., exp: ... }
    req.user = decoded; 
    
    next(); // Pass control to the next handler (the controller)
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};