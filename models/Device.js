const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
  nombre: String,

  // 🔐 hash de la API key
  apiKeyHash: {
    type: String,
    required: true,
    // 👇 AQUÍ ES DONDE VA TU CÓDIGO
    default: "aea96c54cd8d66ec97cdd3b9b28ab77f8bf36ed16fa507fca4f4c0283a8040a9"
  }
});

module.exports = mongoose.models.Device || mongoose.model("Device", DeviceSchema);