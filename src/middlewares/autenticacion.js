const jwt_simple = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta_IN6BM2';

exports.Auth = function(req, res, next) {
    if ( !req.headers.authorization ) {
        return res.status(404)
            .send({ mensaje: 'La peticion, no posee la cabecera de Autenticacion' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt_simple.decode(token, secret);
        if(payload.exp <= moment().unix()){
            return res.status(404)
                .send({ mensaje:'El token ya ha expirado' });
        }
    } catch (error) {
        return res.status(500)
            .send({ mensaje: 'El token no es valido'})
    }

    req.user = payload;
    next();
}