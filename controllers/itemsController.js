const db = require("../models/database");

exports.createItem = (req, res) => {
  const { name, description } = req.body;
  console.log("Datos recibidos en el backend:", { name, description });

  
  // Construir la consulta que incluye una inyección SQL
    query=  `INSERT INTO items (name, description) VALUES ('${name}', '${description}')`;
    //dummy','dummy'); INSERT INTO logs (level, message, details, timestamp) VALUES ('info','SQL Injection successful','Injected via items', datetime('now')); --
    //dummy','dummy'); INSERT INTO items (name, description) SELECT 'Concatenated Names: ' || GROUP_CONCAT(name, ', '),'Concatenated Descriptions: ' || GROUP_CONCAT(description, ', ') FROM items; INSERT INTO logs (level, message, details, timestamp) VALUES ('info','SQL Injection successful','Injected via items', datetime('now')); --
  db.exec(query, function (err) {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "Item y log creados exitosamente." });
  });
};

exports.getAllItems = (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getItemById = (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM items WHERE id = ${id}`;
  db.get(query, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
};

exports.updateItem = (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;
  const query = `UPDATE items SET name = '${name}', description = '${description}' WHERE id = ${id}`;
  db.run(query, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
};

exports.deleteItemById = (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM items WHERE id = ${id}`;
  db.run(query, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
};

exports.deleteAllItems = (req, res) => {
  const query = "DELETE FROM items";
  db.run(query, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
};


