const express = require('express');
const sucursalControlador = require('../controllers/sucursal.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/registrarSucursal', md_autenticacion.Auth, sucursalControlador.AgregarSucursal);
api.put('/editarSucursal/:idSucursal', md_autenticacion.Auth, sucursalControlador.EditarSucursal);
api.delete('/eliminarSucursal/:idSucursal', md_autenticacion.Auth, sucursalControlador.EliminarSucursal);

api.get('/verSucursalesEmpresa/:idSucursal?', md_autenticacion.Auth, sucursalControlador.ObtenerSucursalesPorEmpresa);

module.exports = api;