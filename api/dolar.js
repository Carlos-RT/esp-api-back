const mongoose = require("mongoose");
const Dolar = require("../models/Dolar");

const uri = process.env.MONGO_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(uri);
  isConnected = true;
}

module.exports = async (req, res) => {
  
  // 🔥 CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 manejar preflight (MUY IMPORTANTE)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // POST
    if (req.method === "POST") {
      const { valor } = req.body;

      if (!valor) {
        return res.status(400).json({ error: "Valor requerido" });
      }

      const nuevo = new Dolar({ valor });
      await nuevo.save();

      return res.status(200).json({ mensaje: "Guardado" });
    }

    // GET latest
    if (req.method === "GET" && req.url.includes("latest")) {
      const dato = await Dolar.findOne().sort({ fecha: -1 });
      return res.status(200).json(dato);
    }

    // GET history
    if (req.method === "GET" && req.url.includes("history")) {
      const datos = await Dolar.find().sort({ fecha: -1 }).limit(20);
      return res.status(200).json(datos);
    }

    res.status(404).json({ error: "Ruta no encontrada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
};