const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductoSchema = Schema({
    nombreProducto: String,
    nombreProveedor: String,
    stock: Number,
    idEmpresa: {type: Schema.Types.ObjectId, ref: 'empresa'},
});

module.exports = mongoose.model('productos', ProductoSchema);