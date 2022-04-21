const express = require('express');
const productoSControlador = require('../controllers/productoSucursales.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.put('/enviarProductos/:idProducto', md_autenticacion.Auth, productoSControlador.enviarProducto);
api.get('/ververProductosSucursales/:idSucursal', md_autenticacion.Auth, productoSControlador.verProductosSucursales);
api.put('/gestionarStock/:idProducto', md_autenticacion.Auth, productoSControlador.gestionarProductosSucursales);
api.delete('/eliminarProductosSucursales/:idProducto', md_autenticacion.Auth, productoSControlador.eliminarProductoSucursal);

module.exports = api;