const Producto = require('../models/producto.model');
const ProductoS = require('../models/productoSucursal.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


function AgregarProducto(req, res) {
    const parametros = req.body;
    var productoModel = new Producto();

    if (req.user.rol != 'Empresa')
        return res.status(500).send({ mensaje: 'Solo las empresas pueden acceder a esta función' });

    if (parametros.nombreProducto && parametros.nombreProveedor) {
        productoModel.nombreProducto = parametros.nombreProducto;
        productoModel.nombreProveedor = parametros.nombreProveedor;
        if (parametros.stock <= 0) return res.status(500).send({ mensaje: 'El Stock no puede ser Negativo' })
        productoModel.stock = parametros.stock;
        
        productoModel.idEmpresa = req.user.sub;
        Producto.find({nombreProducto:parametros.nombreProducto, idEmpresa: req.user.sub }, (err, productoEncontrado) => {
                if (productoEncontrado.length == 0) {
                    productoModel.save((err, productoGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                        if (!productoGuardado) return res.status(500).send({ mensaje: 'Error al agregar el Producto' });

                        return res.status(200).send({ producto: productoGuardado });
                    });
                } else {
                    return res.status(500).send({ mensaje: 'Este producto ya existe' });
                }

        })

    } else {
        return res.status(500).send({ mensaje: "Debe llenar los campos necesarios" });
    }
}

function EditarProducto(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if (req.user.rol != 'Empresa')
        return res.status(500).send({ mensaje: 'Solo las empresas pueden acceder a esta función' });

    Producto.find({ nombreProducto: parametros.nombreProducto }, (err, productoEncontrado) => {
        if (productoEncontrado.length == 0) {

            Producto.findOneAndUpdate({ _id: idProd, idEmpresa:req.user.sub }, parametros, { new: true }, (err, productoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!productoActualizado) return res.status(500).send({ mensaje: 'Ocurrio un error o no tiene permitido modificar el producto de esta empresa' });

                return res.status(200).send({ producto: productoActualizado })
            })

        } else {
            parametros.nombreProducto=productoEncontrado.nombreProducto;
            Producto.findOneAndUpdate({ _id: idProd, idEmpresa: req.user.sub }, parametros, { new: true }, (err, productoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!productoActualizado) return res.status(500).send({ mensaje: 'Ocurrio un error o no tiene permitido modificar el producto de esta empresa' });

                return res.status(200).send({ producto: productoActualizado })
            })
        }
    })

}

function EliminarProducto(req, res) {
    var idProd = req.params.idProducto;

    if (req.user.rol == 'Admin')
        return res.status(404).send({ mensaje: 'El administrador no puede eliminar las sucursales de las empresas' });

    Producto.findOneAndDelete({ _id: idProd, idEmpresa: req.user.sub }, (err, productoEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEliminado) return res.status(404).send({ mensaje: 'Ocurrio un error o intento eliminar una producto que no le pertenece' });

        return res.status(200).send({ producto: productoEliminado });
    })
}

function ObtenerProductosPorEmpresa(req, res) {

    if (req.user.rol == 'Empresa') {
        Producto.find({ idEmpresa: req.user.sub }, (err, productosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productosEncontrados) return res.status(500).send({ mensaje: "Error al obtener los productos" });

            return res.status(200).send({ productos: productosEncontrados });
        })
    }
}

function ObtenerProductoId(req, res){
    var idProd = req.params.idProducto;

    Producto.findById(idProd, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ productos: productoEncontrado });
    })
}

function ObtenerProductoNombre(req, res){
    var nombre = req.params.nombre;
    var empresa = req.user.sub;

    Producto.find({idEmpresa: empresa, nombreProducto:{ $regex: nombre, $options: 'i' } }, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ productos: productoEncontrado });
    })
}

function ObtenerProductoProveedor(req, res){
    var nombre = req.params.nombre;
    var empresa = req.user.sub;

    Producto.find({idEmpresa: empresa, nombreProveedor:{ $regex: nombre, $options: 'i' } }, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ productos: productoEncontrado });
    })
}

function StockProducto(req, res) {
    var productoId = req.params.idProducto;
    var parametros = req.body;

    if (req.user.rol == 'Admin')
        return res.status(404).send({ mensaje: 'El administrador no puede eliminar las sucursales de las empresas' });

    if (parametros.stock < 0) {
        var CantidadNegativa = parametros.stock * -1;

        Producto.findById(productoId, (err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Ocurrio un error' });
            if (productoEncontrado.stock < CantidadNegativa)
                return res.status(500).send({ mensaje: 'No hay sufiente stock como para eliminar esa cantidad' })

            ultimaCantidad = CantidadNegativa * -1;
            Producto.findOneAndUpdate({ _id: productoId, idEmpresa: req.user.sub }, { $inc: { stock: ultimaCantidad } }, { new: true }, (err, productoModificado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!productoModificado) return res.status(500).send({ mensaje: "Ocurrio un error o intento editar la cantidad de un producto que no le pertenece" });

                return res.status(200).send({ producto: productoModificado })
            })
        })
    } else {
        Producto.findOneAndUpdate({ _id: productoId, idEmpresa: req.user.sub }, { $inc: { stock: parametros.stock } }, { new: true }, (err, productoModificado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!productoModificado) return res.status(500).send({ mensaje: "Ocurrio un error o intento editar la cantidad de un producto que no le pertenece" });

            return res.status(200).send({ producto: productoModificado })
        })
    }
}



module.exports = {
    AgregarProducto,
    EditarProducto,
    EliminarProducto,
    ObtenerProductosPorEmpresa,
    ObtenerProductoId,
    StockProducto,
    ObtenerProductoNombre,
    ObtenerProductoProveedor
}