const mongoose = require("mongoose");
const crypto = require("crypto");

const Dolar = require("../models/Dolar");
const Device = require("../models/Device");

const uri = process.env.MONGO_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
}

// 🔐 HASH FUNCTION
function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// 🔐 VALIDAR DISPOSITIVO
async function isAuthorized(req) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return false;

  const hashed = hashKey(apiKey);

  const device = await Device.findOne({ apiKeyHash: hashed });

  return !!device;
}

// 🔐 ENCRIPTACIÓN (académico)
const algorithm = "aes-256-cbc";
const secret = process.env.DB_SECRET; // 32 chars

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secret),
    iv
  );

  let encrypted = cipher.update(text.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secret),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // 🔐 POST protegido
    if (req.method === "POST") {

      const authorized = await isAuthorized(req);
      if (!authorized) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { valor } = req.body;

      if (!valor) {
        return res.status(400).json({ error: "Valor requerido" });
      }

      // 🔐 encriptar antes de guardar
      const valorEnc = encrypt(valor);

      const nuevo = new Dolar({ valor: valorEnc });
      await nuevo.save();

      return res.status(200).json({ mensaje: "Guardado seguro" });
    }

    // GET latest
    if (req.method === "GET" && req.url.includes("latest")) {
      const dato = await Dolar.findOne().sort({ fecha: -1 });

      if (!dato) return res.json(null);

      dato.valor = decrypt(dato.valor);

      return res.status(200).json(dato);
    }

    // GET history
    if (req.method === "GET" && req.url.includes("history")) {
      const datos = await Dolar.find().sort({ fecha: -1 }).limit(20);

      const decrypted = datos.map(d => ({
        ...d.toObject(),
        valor: decrypt(d.valor)
      }));

      return res.status(200).json(decrypted);
    }

    res.status(404).json({ error: "Ruta no encontrada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
};