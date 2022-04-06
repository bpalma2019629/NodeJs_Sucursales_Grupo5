const express = require('express');
const productoControlador = require('../controllers/producto.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/agregarProducto', md_autenticacion.Auth, productoControlador.AgregarProducto);
api.put('/editarProducto/:idProducto', md_autenticacion.Auth, productoControlador.EditarProducto);
api.delete('/eliminarProducto/:idProducto', md_autenticacion.Auth, productoControlador.EliminarProducto);
api.get('/verProductosEmpresa', md_autenticacion.Auth, productoControlador.ObtenerProductosPorEmpresa);
api.put('/stockProducto/:idProducto', md_autenticacion.Auth, productoControlador.StockProducto);

module.exports = api;