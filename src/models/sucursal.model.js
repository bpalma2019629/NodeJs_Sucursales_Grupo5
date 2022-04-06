const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SucursalSchema = Schema({
    nombreSucursal: String,
    direccionSucursal: String,
    idEmpresa: {type: Schema.Types.ObjectId, ref: 'empresa'},
});

module.exports = mongoose.model('sucursales', SucursalSchema);