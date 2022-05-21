const Sucursales = require('../models/sucursal.model');
const ProductoS = require('../models/productoSucursal.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

function AgregarSucursal(req, res) {
    var parametros = req.body;
    var sucursalModel = new Sucursales();

    if (req.user.rol == 'Admin')
        return res.status(404).send({ mensaje: 'El administrador no puede agregarle sucursales a las empresas' });

    if (parametros.nombreSucursal && parametros.direccionSucursal && parametros.municipio) {
        sucursalModel.nombreSucursal = parametros.nombreSucursal;
        sucursalModel.direccionSucursal = parametros.direccionSucursal;
        sucursalModel.municipio = parametros.municipio;
        sucursalModel.idEmpresa = req.user.sub;

        Sucursales.findOne({ nombreSucursal: parametros.nombreSucursal, idEmpresa: req.user.sub }, (err, sucursalEncontrada) => {
            Sucursales.findOne({direccionSucursal: parametros.direccionSucursal}, (err, direccion)=>{
                if (!sucursalEncontrada) {
                    if(!direccion){
                        sucursalModel.save((err, sucursalGuardada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                            if (!sucursalGuardada) return res.status(500).send({ mensaje: "Error al guardar la sucursal" });
        
                            return res.status(200).send({ sucursal: sucursalGuardada });
                        });
                    }else{
                        return res.status(500).send({ mensaje: 'Esta direccion ya esta en el sistema' });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'Esta sucursal ya existe, intente con otro nombre' });
                }
            })
        })
    } else {
        return res.status(500).send({ mensaje: "Debe rellenar los campos necesarios" });
    }
}


function EditarSucursal(req, res) {
    var idSucur = req.params.idSucursal;
    var parametros = req.body;

    if (req.user.rol == 'Admin')
        return res.status(404).send({ mensaje: 'El administrador no puede editar a las sucursales de las empresas' });
    Sucursales.findById(idSucur, (err, infoSucur)=>{
        Sucursales.findOne({ nombreSucursal: parametros.nombreSucursal, idEmpresa: req.user.sub }, (err, sucursalEncontrada) => {
            if (!sucursalEncontrada || infoSucur.nombreSucursal == parametros.nombreSucursal) {
                Sucursales.findOne({ direccionSucursal: parametros.direccionSucursal }, (err, direccionEncontrada) => {
                    if (!direccionEncontrada || direccionEncontrada.direccionSucursal == infoSucur.direccionSucursal) {
                        Sucursales.findOneAndUpdate({ _id: idSucur, idEmpresa: req.user.sub }, parametros, { new: true }, (err, sucursalActualizada) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if (!sucursalActualizada) return res.status(404).send({ mensaje: "Ocurrio un error o no tiene permitido modificar la sucursal de esta empresa." });
    
                            return res.status(200).send({ sucursal: sucursalActualizada });
                        })
                    }else{
                        return res.status(500).send({mensaje:'Esta direccion ya es existente'})
                    }
                })
            } else {
                return res.status(500).send({ mensaje: 'Este nombre no esta disponible' })
            }
        })
    })
}


function EliminarSucursal(req, res) {
    var idSucur = req.params.idSucursal;

    if (req.user.rol == 'Admin')
        return res.status(404).send({ mensaje: 'El administrador no puede eliminar las sucursales de las empresas' });

    ProductoS.deleteMany({ idSucursal: idSucur }, (err, productosEliminados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosEliminados) return res.status(404).send({ mensaje: 'Error al eliminar los productos' });
        Sucursales.findOneAndDelete({ _id: idSucur, idEmpresa: req.user.sub }, (err, sucursalEliminada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!sucursalEliminada) return res.status(404).send({ mensaje: 'Ocurrio un error o intento eliminar una sucursal que no le pertenece' });

            return res.status(200).send({ sucursal: sucursalEliminada });
        })
    })
}


function ObtenerSucursalesPorEmpresa(req, res) {
    var idSucur
    if (req.user.rol == 'Empresa') {
        idSucur = req.user.sub
    } else if (req.user.rol == 'Admin') {

        if (req.params.idSucursal == null) {
            return res.status(500).send({ mensaje: 'debe enviar el id de la empresa' });
        }

        idSucur = req.params.idSucursal;
    }

    Sucursales.find({ idEmpresa: idSucur }, (err, sucursalesEncontradas) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!sucursalesEncontradas) return res.status(500).send({ mensaje: "Error al obtener las sucursales" });

        return res.status(200).send({ sucursales: sucursalesEncontradas });
    })
}

function ObtenerSucursalId(req, res) {
    var idSucu = req.params.idSucursal;

    Sucursales.findById(idSucu, (err, sucursalEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!sucursalEncontrada) return res.status(404).send({ mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ sucursales: sucursalEncontrada });
    })
}

function ObtenerSucursalNombre(req, res) {
    var nombre = req.params.nombre;
    var empresa;

    if (req.user.rol == 'Empresa') {
        empresa = req.user.sub
    } else if (req.user.rol == 'Admin') {

        if (req.params.idEmpresa == null) {
            return res.status(500).send({ mensaje: 'debe enviar el id de la empresa' });
        }

        empresa = req.params.idEmpresa;
    }


    Sucursales.find({ idEmpresa: empresa, nombreSucursal: { $regex: nombre, $options: 'i' } }, (err, sucursalEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!sucursalEncontrada) return res.status(404).send({ mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ sucursales: sucursalEncontrada });
    })
}


module.exports = {
    AgregarSucursal,
    EditarSucursal,
    EliminarSucursal,
    ObtenerSucursalesPorEmpresa,
    ObtenerSucursalId,
    ObtenerSucursalNombre
}