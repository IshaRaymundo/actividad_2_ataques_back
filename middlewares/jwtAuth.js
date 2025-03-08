const jwt = require("jsonwebtoken");
const db = require("../models/database");
require("dotenv").config(); // Cargar variables de entorno

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No se proporcionó token" });

  // Verifica si el token está en la tabla de tokens expirados
  const checkExpiredQuery = `SELECT * FROM expired_tokens WHERE token = ?`;
  db.get(checkExpiredQuery, [token], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(401).json({ error: "Token expirado, inicie sesión nuevamente" });

    // Verifica validez del token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(500).json({ error: "Token inválido o expirado" });
      req.user = decoded;
      next();
    });
  });
};
