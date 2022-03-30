const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
    nombreEmpresa: String,
    usuario: String,
    password: String,
    rol: String,
    tipo: String,
    ProductosEmpresa: [{
        nombreProducto: String,
        nombreProveedor: String,
        stock: Number
    }],
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);