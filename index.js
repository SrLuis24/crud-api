import express from "express";
import mysql from "mysql2";
import cors from 'cors';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());


const database = mysql.createConnection({
    host: "sql312.infinityfree.com",
    user: "if0_36662414",
    password: "8z3WDydQpKU8L",
    database: "if0_36662414_notas"
})

database.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
    const sql = "SELECT * FROM tnotes";
    database.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
})

app.get('/select/:id', (req, res) => {
  const sql = "SELECT * FROM tnotes WHERE id = ?";
  const id = parseInt(req.params.id);

  database.query(sql, [id], (err, data) => {
    if(err) return res.json(err);
    return res.json(data);
  })
})

app.put('/favorite/:id', (req, res) => {
  const sqlSelect = "SELECT favorito FROM tnotes WHERE id = ?";
  const sqlUpdate = "UPDATE tnotes SET favorito = ? WHERE id = ?";
  const id = parseInt(req.params.id);
  const { favorito } = req.body;

  if (favorito === undefined) {
    return res.status(400).json({ error: 'favoritoBD is required' });
  }

  database.query(sqlSelect, [id], (err, results) => {
    if (err) {
      console.error('Error en la consulta de selección:', err);
      return res.status(500).json({ error: 'Error en la consulta de selección' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'ID no encontrado' });
    }

    const currentFavorito = results[0].favorito;

    if (currentFavorito === favorito) {
      return res.status(200).json({ message: 'No se requiere actualización, el valor ya es el mismo' });
    }

    database.query(sqlUpdate, [favorito, id], (err, result) => {
      if (err) {
        console.error('Error en la consulta de actualización:', err);
        return res.status(500).json({ error: 'Error en la consulta de actualización' });
      }

      console.log('Filas actualizadas:', result.affectedRows);
      // Confirmar la actualización
      database.query(sqlSelect, [id], (err, results) => {
        if (err) {
          console.error('Error en la consulta de selección post-actualización:', err);
          return res.status(500).json({ error: 'Error en la consulta de selección post-actualización' });
        }
        console.log('Valor actualizado:', results[0].favorito);
        return res.json({ message: 'updated', updatedValue: results[0].favorito });
      });
    });
  });
});

app.delete('/delete/:id', (req, res) => {
    const sql = "DELETE FROM tnotes WHERE id = ?";
    const id = parseInt(req.params.id);
    
    database.query(sql, [id], (err, data) => {
        if(err) return res.json(err);
        return res.json("deleted");
    })
});

app.post('/create', (req, res) => {
    const sql = "INSERT INTO tnotes (titulo, contenido, fecha, color, favorito) VALUES (?, ?, NOW(), ?, 0)";
    const values = [
        req.body.titulo,
        req.body.contenido,
        req.body.color,
    ]
    database.query(sql, values, (err, data) => {
        if(err) return res.json(err);
        return res.json("created");
    })
})

app.put('/update/:id', (req, res) => {
    const sql = "UPDATE tnotes SET titulo = ?, contenido = ?, color = ?, fecha = NOW() WHERE id = ?";
    const id = req.params.id;
    const values = [
        req.body.titulo,
        req.body.contenido,
        req.body.color,
    ]
    database.query(sql, [...values, id], (err, data) => {
        if(err) return res.json(err);
        return res.json("updated");
    })
}) 

app.listen(PORT)

console.log(`Escuchando por el puerto ${PORT}`);