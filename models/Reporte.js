const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  nombreEmpleado: { type: String, required: true },
  correoEmpleado: { type: String },
  camara: { type: String, required: true },
  funcionamiento: { type: String, enum: ['bien', 'mal'], required: true },
  imagen: { type: String, enum: ['bien', 'mal'], required: true },
  movimiento: { type: String, enum: ['bien', 'mal'], required: true },
  comentarios: { type: String },
  archivoNombre: { type: String },
  archivoRuta: { type: String },
  calificacion: {
  type: String,
  enum: ['bueno', 'deficiente'], 
  default: null
},
  comentarioJefe: { type: String, default: '' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reporte', reporteSchema);
