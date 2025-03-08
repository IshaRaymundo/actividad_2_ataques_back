const db = require("../models/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Cargar variables de entorno

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = (req, res) => {
  const { email, password, role = "user" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
  db.get(checkUserQuery, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserQuery = `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`;

    db.run(insertUserQuery, [email, hashedPassword, role], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: "1h" }); 

      res.json({
        id: this.lastID,
        email,
        role,
        token,
      });
    });
  });
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Credenciales inválidas" });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ email, role: row.role }, JWT_SECRET, { expiresIn: "1h" });

    const insertSessionQuery = `INSERT INTO sessions (email, token) VALUES (?, ?)`;
    db.run(insertSessionQuery, [email, token], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: row.id, token, role: row.role });
    });
  });
};

exports.logoutUser = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(400).json({ error: "Token requerido" });

  // Verificar si el token está registrado en la base de datos
  const query = `SELECT * FROM sessions WHERE token = ?`;
  db.get(query, [token], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Token no encontrado en la base de datos" });

    // Ahora puedes invalidar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token inválido o ya expirado" });
      }

      const insertQuery = `INSERT INTO expired_tokens (token) VALUES (?)`;

      db.run(insertQuery, [token], function (err) {
        if (err) {
          console.error("Error al insertar el token expirado:", err.message);
          return res.status(500).json({ error: "Error al invalidar el token" });
        }

        res.json({ message: "Sesión cerrada y token invalidado" });
      });
    });
  });
};




exports.getUserById = (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM users WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
};
