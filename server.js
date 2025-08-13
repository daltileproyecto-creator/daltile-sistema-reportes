// Importaciones
const express = require('express');
const mongoose = require('mongoose'); // ✅ Solo aquí
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Inicializar app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: 'mi_secreto_seguro', 
  resave: false,
  saveUninitialized: false
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error al conectar a MongoDB:", err));

// Rutas de reportes
const reporteRoutes = require('./routes/reporteRoutes');
app.use('/api/reportes', reporteRoutes);

// Middleware de autenticación
function authMiddleware(rol) {
  return function (req, res, next) {
    if (req.session && req.session.usuario && req.session.rol === rol) {
      next();
    } else {
      res.redirect('/LOGIN.HTML');
    }
  };
}

// Rutas protegidas
app.get('/EMPLEADO.HTML', authMiddleware('empleado'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'EMPLEADO.HTML'));
});

app.get('/JEFE.HTML', authMiddleware('jefe'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'JEFE.HTML'));
});

app.get('/SOPORTE_JEFE.HTML', authMiddleware('jefe'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'SOPORTE_JEFE.HTML'));
});

app.get('/SOPORTE_EMP.HTML', authMiddleware('empleado'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'SOPORTE_EMP.HTML'));
});

// Ruta POST de login
app.post('/login', (req, res) => {
  const { codigo, password } = req.body;

  const usuarios = [
    { codigo: 'EMP1', password: 'empleado1', rol: 'empleado' },
    { codigo: 'EMP2', password: 'empleado2', rol: 'empleado' },
    { codigo: 'JEFE123', password: 'jefeDaltile', rol: 'jefe' }
  ];

  const usuario = usuarios.find(u => u.codigo === codigo && u.password === password);

  if (usuario) {
    req.session.usuario = usuario.codigo;
    req.session.rol = usuario.rol;
    return res.redirect(`/${usuario.rol.toUpperCase()}.HTML`);
  }

  res.send('<script>alert("❌ Código o contraseña incorrectos."); window.location.href="/LOGIN.HTML";</script>');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/LOGIN.HTML');
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LOGIN.HTML'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔌 Servidor corriendo en http://localhost:${PORT}`);
});
