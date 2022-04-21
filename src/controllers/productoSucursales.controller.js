const ProductoS = require('../models/productoSucursal.model');
const Producto = require('../models/producto.model');
const Sucursales = require('../models/sucursal.model');

//Enviar ProductosEmpresa
function enviarProducto(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;
    var productoModel = new ProductoS();
    if (req.user.rol == 'Empresa') {
        if (parametros.stock && parametros.nombreSucursal) {
            Producto.findById(idProd, (err, productoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: "Error en  la Peticion" });
                if (!productoEncontrado) return res.status(404).send({ mensaje: "Error al encontrar el producto" });

                productoModel.nombreProducto = productoEncontrado.nombreProducto;
                if (parametros.stock <= 0) return res.status(500).send({ mensaje: 'El Stock no puede ser Negativo' })
                if (parametros.stock > productoEncontrado.stock) return res.status(500).send({ mensaje: 'No cuenta con el Stock Necesario' })
                productoModel.stock = parametros.stock;
                Sucursales.find({ nombreSucursal: parametros.nombreSucursal }, (err, sucursalEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!sucursalEncontrada) return res.status(404).send({ mensaje: 'Error al cargar las sucursales' });
                    productoModel.idSucursal = sucursalEncontrada[0]._id;
                    ProductoS.find({ idSucursal: productoModel.idSucursal, nombreProducto: productoModel.nombreProducto }, (err, productoEncontrado) => {
                        if (productoEncontrado.length == 0) {
                            Producto.findByIdAndUpdate(idProd, { $inc: { stock: parametros.stock * -1 } }, { new: true }, (err, stockActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                if (!stockActualizado) return res.status(404).send({ mensaje: 'Error en editar el stock' })
                                productoModel.save((err, productoGuardado) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                    if (!productoGuardado) return res.status(400).send({ mensaje: "Error al agregar el producto" });
                                    return res.status(200).send({ producto: productoGuardado });
                                })
                            })
                        } else {
                            Producto.findByIdAndUpdate(idProd, { $inc: { stock: parametros.stock * -1 } }, { new: true }, (err, stockActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                if (!stockActualizado) return res.status(404).send({ mensaje: 'Error en editar el stock' })
                                ProductoS.findOneAndUpdate({ idSucursal: productoModel.idSucursal, nombreProducto: productoModel.nombreProducto }, { $inc: { stock: parametros.stock } }, { new: true }, (err, stockSActualizado) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                    if (!stockSActualizado) return res.status(400).send({ mensaje: "Error al agregar el producto" });
                                    return res.status(200).send({ producto: stockSActualizado });
                                })
                            })
                        }
                    })
                })
            })
        } else {
            return res.status(500).send({ mensaje: "Rellene todos los Campos" })
        }
    }
}

function ObtenerProductoSucursalId(req, res){
    var idProd = req.params.idProducto;

    ProductoS.findById(idProd, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ productos: productoEncontrado });
    })
}

function verProductosSucursales(req, res) {
    var idSuc = req.params.idSucursal;
    if (req.user.rol == 'Empresa') {
        ProductoS.find({ idSucursal: idSuc }, (err, productosSucursales) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosSucursales) return res.status(500).send({ mensaje: "Error al obtener los productos" });

            return res.status(200).send({ productos: productosSucursales });
        })
    }
}

function gestionarProductosSucursales(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;
    if (req.user.rol == 'Empresa') {
        if (parametros.stock) {
            if (parametros.stock <= 0) return res.status(500).send({ mensaje: 'No puede ser Negativo' })
            ProductoS.findById(idProd, (err, productoEncontrado)=>{
                if(parametros.stock>productoEncontrado.stock) return res.status(500).send({ mensaje: 'No cuenta con esa cantidad en stock'});
                ProductoS.findByIdAndUpdate(idProd, { $inc: { stock: parametros.stock * -1 } }, { new: true }, (err, stockSActualizado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if (!stockSActualizado) return res.status(400).send({ mensaje: "Error al gestionar el producto" });
                    return res.status(200).send({ producto: stockSActualizado });
                })
            })
        }
    }
}

function eliminarProductoSucursal(req, res) {
    var idProd = req.params.idProducto;
    if (req.user.rol == 'Empresa') {
        ProductoS.findByIdAndDelete(idProd, (err, productoEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!productoEliminado) return res.status(404).send({ mensaje: 'Error al eliminar el producto' });

            return res.status(200).send({ producto: productoEliminado });
        })
    }
}

//exports

module.exports = {
    enviarProducto,
    verProductosSucursales,
    gestionarProductosSucursales,
    eliminarProductoSucursal,
    ObtenerProductoSucursalId
}