const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reporte = require('../models/Reporte');
const enviarCorreo = require('../Utils/emailService');

const router = express.Router();

// ✅ Verifica que exista la carpeta /uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Configuración de Multer (sin modificar originalname)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname.replace(/\s+/g, '_');
    const nombreFinal = Date.now() + '-' + originalName;
    cb(null, nombreFinal);
  }
});

const upload = multer({ storage: storage });

// 🟢 GUARDAR NUEVO REPORTE
router.post('/enviar', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió el archivo. Asegúrate de subir un PDF o Word.' });
    }

    const nuevoReporte = new Reporte({ 
      nombreEmpleado: req.body.nombre,
      correoEmpleado: req.body.correo,
      camara: req.body.camara,
      funcionamiento: req.body.funcionamiento,
      imagen: req.body.imagen,
      movimiento: req.body.movimiento,
      comentarios: req.body.comentarios,
      archivoNombre: req.file.filename,
      archivoRuta: req.file.path,
      fecha: new Date()
    });

    await nuevoReporte.save();

    enviarCorreo(
      'daltileproyecto@gmail.com',
      '📢 Nuevo reporte de cámara enviado',
      `
        <p><strong>${req.body.nombre}</strong> ha enviado un nuevo reporte técnico.</p>
        <p><strong>Cámara:</strong> ${req.body.camara}</p>
        <p>Revisa el panel para calificarlo en el siguiente enlace:</p>
        <p style="margin-top: 10px;">
          👉 <a href="https://daltile-sistema-reportes.onrender.com/" style="color: #1a73e8; text-decoration: underline;">
            https://daltile-sistema-reportes.onrender.com/
          </a>
        </p>
      `
    );

    res.status(201).json({ mensaje: '✅ Reporte guardado correctamente' });

  } catch (error) {
    console.error('❌ Error al guardar el reporte:', error);
    res.status(500).json({ error: 'Error interno al guardar el reporte' });
  }
});

// 🔵 OBTENER TODOS LOS REPORTES
router.get('/', async (req, res) => {
  try {
    const reportes = await Reporte.find().sort({ fecha: -1 });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// 🟡 CALIFICAR UN REPORTE
router.put('/calificar/:id', async (req, res) => {
  try {
    const { calificacion, comentarioJefe } = req.body;

    const reporte = await Reporte.findById(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    reporte.calificacion = calificacion;
    reporte.comentarioJefe = comentarioJefe;

    await reporte.save();

    if (reporte.correoEmpleado) {
      await enviarCorreo(
        reporte.correoEmpleado,
        '📝 Calificación de tu reporte',
        `<p>Tu reporte sobre la cámara <strong>${reporte.camara}</strong> fue calificado como <strong>${calificacion}</strong>.</p>
         <p><strong>Comentario del jefe:</strong><br>${comentarioJefe}</p>`
      ).catch(err => {
        console.warn('⚠️ Error al enviar correo al empleado:', err.message);
      });
    }

    res.json({ mensaje: '✅ Reporte calificado y notificado al empleado.' });

  } catch (error) {
    console.error('❌ Error al calificar reporte:', error);
    res.status(500).json({ error: 'Error al calificar reporte' });
  }
});

// 🔴 ELIMINAR REPORTE
router.delete('/:id', async (req, res) => {
  try {
    await Reporte.findByIdAndDelete(req.params.id);
    res.json({ mensaje: '🗑️ Reporte eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
});

module.exports = router;
