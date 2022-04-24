const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/registrar', usuarioControlador.Registrar);
api.post('/agregarEmpresa',md_autenticacion.Auth, usuarioControlador.Registrar);
api.post('/login', usuarioControlador.Login);
api.put('/editarUsuario/:idEmpresa?', md_autenticacion.Auth, usuarioControlador.EditarUsuario);
api.delete('/eliminarUsuario/:idEmpresa?', md_autenticacion.Auth, usuarioControlador.EliminarUsuario);
api.get('/empresas',md_autenticacion.Auth, usuarioControlador.encontrarEmpresas)

module.exports = api;