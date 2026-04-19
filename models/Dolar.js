const mongoose = require("mongoose");

const DolarSchema = new mongoose.Schema({
  valor: {
    type: String, // ✅ ahora sí acepta el valor encriptado
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

// 🔥 ESTA LÍNEA CAMBIA:
module.exports = mongoose.models.Dolar || mongoose.model("Dolar", DolarSchema);