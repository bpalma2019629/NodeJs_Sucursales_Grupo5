const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductoSucursalSchema = Schema({
    nombreProducto: String,
    stock: Number,
    cantidadVendida: Number,
    idSucursal: {type: Schema.Types.ObjectId, ref: 'sucursal'},
});

module.exports = mongoose.model('productosSucursal', ProductoSucursalSchema);