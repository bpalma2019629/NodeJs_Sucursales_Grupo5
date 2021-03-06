const Usuario = require("../models/usuario.model");
const Producto = require('../models/producto.model');
const ProductoS = require('../models/productoSucursal.model');
const Sucursales = require('../models/sucursal.model');

const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

function CreacionAdmin() {
  Usuario.find(
    { rol: "Admin", usuario: "SuperAdmin" },
    (err, usuarioEcontrado) => {
      if (usuarioEcontrado.length == 0) {
        bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
          Usuario.create({
            nombreEmpresa: undefined,
            tipo: undefined,
            ProductosEmpresa: undefined,
            usuario: "SuperAdmin",
            password: passwordEncriptada,
            rol: "Admin",
          });
        });
      }
    }
  );
}

function Registrar(req, res) {
  var parametros = req.body;
  var usuarioModel = new Usuario();

  if (
    parametros.nombreEmpresa &&
    parametros.usuario &&
    parametros.password &&
    parametros.tipo
  ) {
    usuarioModel.nombreEmpresa = parametros.nombreEmpresa;
    usuarioModel.usuario = parametros.usuario;
    usuarioModel.password = parametros.password;
    usuarioModel.tipo = parametros.tipo;
    usuarioModel.rol = "Empresa";

    Usuario.find({ nombreEmpresa: parametros.nombreEmpresa }, (err, nombreEncontrado) => {
      if (nombreEncontrado.length == 0) {
        Usuario.find({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
          if (usuarioEncontrado.length == 0) {
            bcrypt.hash(
              parametros.password,
              null,
              null,
              (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                  if (err)
                    return res.status(500).send({ mensaje: "Error en la peticion" });
                  if (!usuarioGuardado)
                    return res.status(500).send({ mensaje: "Error al agregar el Usuario" });

                  return res.status(200).send({ usuario: usuarioGuardado });
                });
              }
            );
          } else {
            return res.status(500).send({ mensaje: "Este usuario, ya  se encuentra utilizado" });
          }
        });
      } else {
        return res.status(500).send({ mensaje: "Este nombre ya se encuentra utilizado" })
      }
    })
  }
}

function agregarEmpresa(req, res) {
  var parametros = req.body;
  var usuarioModel = new Usuario();

  if (req.user.sub != 'Admin') return res.status(500).send({ mensaje: 'No eres un Administrador' })
  if (
    parametros.nombreEmpresa &&
    parametros.usuario &&
    parametros.password &&
    parametros.tipo
  ) {
    usuarioModel.nombreEmpresa = parametros.nombreEmpresa;
    usuarioModel.usuario = parametros.usuario;
    usuarioModel.password = parametros.password;
    usuarioModel.tipo = parametros.tipo;
    usuarioModel.rol = "Empresa";
    Usuario.find({ nombreEmpresa: parametros.nombreEmpresa }, (err, nombreEncontrado) => {
      if (nombreEncontrado.length == 0) {
        Usuario.find({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
          if (usuarioEncontrado.length == 0) {
            bcrypt.hash(
              parametros.password,
              null,
              null,
              (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                  if (err)
                    return res.status(500).send({ mensaje: "Error en la peticion" });
                  if (!usuarioGuardado)
                    return res.status(500).send({ mensaje: "Error al agregar el Usuario" });

                  return res.status(200).send({ usuario: usuarioGuardado });
                });
              }
            );
          } else {
            return res.status(500).send({ mensaje: "Este usuario, ya  se encuentra utilizado" });
          }
        });
      } else {
        return res.status(500).send({ mensaje: "Este nombre ya se encuentra utilizado" })
      }
    })
  }
}

function Login(req, res) {
  var parametros = req.body;
  Usuario.findOne({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
    if (usuarioEncontrado) {
      bcrypt.compare(
        parametros.password,
        usuarioEncontrado.password,
        (err, verificacionPassword) => {
          if (verificacionPassword) {
            if (parametros.obtenerToken === "true") {
              return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) });
            } else {
              usuarioEncontrado.password = undefined;
              return res.status(200).send({ usuario: usuarioEncontrado });
            }
          } else {
            return res.status(500).send({ mensaje: "Las contrase??as no coinciden" });
          }
        }
      );
    } else {
      return res.status(500).send({ mensaje: "Error, el usuario no se encuentra registrado." });
    }
  });
}

function EditarUsuario(req, res) {
  var parametros = req.body;

  let idEmpresa

  if (req.user.rol == 'Empresa') {
    idEmpresa = req.user.sub
  } else if (req.user.rol == 'Admin') {

    if (req.params.idEmpresa == null)
      return res.status(500).send({ mensaje: 'debe enviar el id de la empresa' });

    if (req.params.idEmpresa == req.user.sub)
      return res.status(500).send({ mensaje: 'error, no puede editar el admin' });

    idEmpresa = req.params.idEmpresa;
  }

  parametros.rol = undefined;
  Usuario.findOne({ nombreEmpresa: parametros.nombreEmpresa}, (err, nombreEncontrado) => {
    if (nombreEncontrado==null || nombreEncontrado._id == idEmpresa ) {
      Usuario.findOne({ usuario: parametros.usuario}, (err, usuarioEncontrado) => {
        if ( usuarioEncontrado==null || usuarioEncontrado._id == idEmpresa) {
          Usuario.findByIdAndUpdate(idEmpresa, parametros, { new: true },
            (err, usuarioActualizado) => {
              if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

              if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar el Usuario' });

              return res.status(200).send({ usuario: usuarioActualizado })
            }
          )
        }else{
          return res.status(500).send({mensaje:'Este usuario no esta disponible'})
        }
      })
    } else {
      return res.status(500).send({ mensaje: 'Este nombre no esta disponible' })
    }
  })
}

function EliminarUsuario(req, res) {
  let idEmpresa

  if (req.user.rol == 'Empresa') {
    idEmpresa = req.user.sub
  } else if (req.user.rol == 'Admin') {

    if (req.params.idEmpresa == null) {
      return res.status(500).send({ mensaje: 'debe enviar el id de la empresa' });
    }

    if (req.params.idEmpresa == req.user.sub) {
      return res.status(500).send({ mensaje: 'error, no puede eliminar el admin' });
    }

    idEmpresa = req.params.idEmpresa;
  }

  Producto.deleteMany({ idEmpresa: idEmpresa }, (err, productoEliminado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
    if (!productoEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el Producto' });
    Sucursales.find({ idEmpresa: idEmpresa }, (err, sucursalesEncontradas) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
      if (!sucursalesEncontradas) return res.status(500).send({ mensaje: 'Error al Encontrar las Sucursales' });
      for (var i = 0; i < sucursalesEncontradas.length; i++) {
        ProductoS.deleteMany({ idSucursal: sucursalesEncontradas[i]._id }, (err, productosSucursalesEliminados) => {
          if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
          if (!productosSucursalesEliminados) return res.status(500).send({ mensaje: 'Error al eliminar los productos de las Sucursale' });
        })
      }
      Sucursales.deleteMany({ idEmpresa: idEmpresa }, (err, sucursalEliminada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!sucursalEliminada) return res.status(500).send({ mensaje: 'Error al eliminar los productos de las Sucursale' });
        Usuario.findByIdAndDelete(idEmpresa,
          (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al eliminar el Usuario' });
            return res.status(200).send({ usuario: usuarioActualizado })
          })
      })
    })
  })

}

function encontrarEmpresas(req, res) {

  if (req.user.rol == 'Admin') {
    Usuario.find({ rol: "Empresa" }, (err, usuariosEncontrados) => {
      if (usuariosEncontrados.length == 0) return res.status(200).send({ mensaje: "no cuenta con empresas" })

      return res.status(200).send({ empresas: usuariosEncontrados })
    })
  } else {
    return res.status(500).send({ mensaje: 'No Esta autorizado para ver las empresas' })
  }
}

function encontrarEmpresaId(req, res) {
  var idEmpresa = req.params.id;
  Usuario.findById(idEmpresa, (err, empresaEncontrada) => {
    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
    if (!empresaEncontrada) return res.status(500).send({ mensaje: "Error al obtener la empresa" });

    return res.status(200).send({ empresa: empresaEncontrada });
  })
}

module.exports = {
  Registrar,
  agregarEmpresa,
  Login,
  EditarUsuario,
  EliminarUsuario,
  CreacionAdmin,
  encontrarEmpresas,
  encontrarEmpresaId
};