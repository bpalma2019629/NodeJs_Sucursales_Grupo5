const Sucursales = require('../models/sucursal.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');

function AgregarSucursal(req, res){
    var parametros = req.body;
    var sucursalModel = new Sucursales();

    if(req.user.rol == 'Admin')
    return res.status(404).send ({mensaje: 'El administrador no puede agregarle sucursales a las empresas'});

    if(parametros.nombreSucursal && parametros.direccionSucursal && parametros.municipio){
        sucursalModel.nombreSucursal = parametros.nombreSucursal;
        sucursalModel.direccionSucursal = parametros.direccionSucursal;
        sucursalModel.municipio = parametros.municipio;
        sucursalModel.idEmpresa = req.user.sub;

        Sucursales.find({nombreSucursal: parametros.nombreSucursal}, (err, sucursalEncontrada)=>{
            if (sucursalEncontrada.length == 0){

                sucursalModel.save((err, sucursalGuardada) =>{
                    if(err) return res.status(500).send({mensaje: "Error en la peticion"});
                    if(!sucursalGuardada) return res.status(500).send({mensaje: "Error al guardar la sucursal"});

                    return res.status(200).send({sucursal: sucursalGuardada});
                });
            }else{
                return res.status(500).send({mensaje:'Esta sucursal ya existe, intente con otro nombre'});
            }
        })
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}


function EditarSucursal(req, res){
    var idSucur = req.params.idSucursal;
    var parametros = req.body;

    if(req.user.rol == 'Admin')
    return res.status(404).send ({mensaje: 'El administrador no puede editar a las sucursales de las empresas'});

    Sucursales.find({nombreSucursal: parametros.nombreSucursal}, (err, sucursalEncontrada)=>{
        if (sucursalEncontrada.length == 0){

            Sucursales.findOneAndUpdate({_id:idSucur, idEmpresa: req.user.sub}, parametros, {new: true} ,(err, sucursalActualizada) => {
                if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!sucursalActualizada) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido modificar la sucursal de esta empresa."});

                return res.status(200).send({sucursal: sucursalActualizada});
            })
        }else{
            return res.status(500).send({mensaje:'Esta sucursal ya existe, intente con otro nombre'});
        }
    })
}


function EliminarSucursal (req, res){
    var idSucur = req.params.idSucursal;

    if(req.user.rol == 'Admin')
    return res.status(404).send ({mensaje: 'El administrador no puede eliminar las sucursales de las empresas'});

    Sucursales.findOneAndDelete({_id:idSucur, idEmpresa: req.user.sub},(err, sucursalEliminada) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!sucursalEliminada) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar una sucursal que no le pertenece'});

        return res.status(200).send({sucursal: sucursalEliminada});
    })
}


function ObtenerSucursalesPorEmpresa(req, res){
    var idSucur
    if(req.user.rol == 'Empresa'){
        idSucur = req.user.sub
      }else if(req.user.rol == 'Admin'){
    
        if(req.params.idSucursal==null){
          return res.status(500).send({ mensaje: 'debe enviar el id de la empresa' });
        }
    
        idSucur = req.params.idSucursal;
      }

    Sucursales.find({ idEmpresa : idSucur }, (err, sucursalesEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!sucursalesEncontradas) return res.status(500).send({ mensaje: "Error al obtener las sucursales"});

        if(sucursalesEncontradas==0)
        return res.status(404).send({mensaje: 'No se encontraron sucursales'});

        return res.status(200).send({ sucursales: sucursalesEncontradas });
    })
}


module.exports = {
    AgregarSucursal,
    EditarSucursal,
    EliminarSucursal,
    ObtenerSucursalesPorEmpresa
}