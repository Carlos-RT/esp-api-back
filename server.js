const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns")
const Dolar = require("./models/Dolar");

const app = express();
app.use(cors());
app.use(express.json());

dns.setServers(['1.1.1.1', '8.8.8.8'])

// ====== CONEXIÓN MONGO ======
mongoose.connect("mongodb+srv://carlosramirez02:sololausoyoynadiemas367680@cluster0.txr8e.mongodb.net/dolarDB?appName=Cluster0")
  .then(() => console.log("🟢 MongoDB conectado"))
  .catch(err => console.log(err));

// ====== RUTA TEST ======
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// ====== GUARDAR DATO (ESP32) ======
app.post("/api/dolar", async (req, res) => {
  try {
    console.log("📥 Datos recibidos:", req.body);

    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({ error: "Valor requerido" });
    }

    const nuevo = new Dolar({ valor });
    await nuevo.save();

    res.json({ mensaje: "Guardado correctamente" });

  } catch (error) {
    console.error("❌ Error en POST:", error); // 🔥 IMPORTANTE
    res.status(500).json({ error: "Error interno" });
  }
});

// ====== OBTENER ÚLTIMO DATO ======
app.get("/api/dolar/latest", async (req, res) => {
  try {
    const dato = await Dolar.findOne().sort({ fecha: -1 });
    res.json(dato);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ====== HISTORIAL ======
app.get("/api/dolar/history", async (req, res) => {
  try {
    const datos = await Dolar.find().sort({ fecha: -1 }).limit(20);
    res.json(datos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ====== INICIAR SERVIDOR ======
app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});