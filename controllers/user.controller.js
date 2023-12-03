const db = require("../models");
const User = db.user;
var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.updateProfile= (req, res) => {
  User.update({
    username: req.body.username,
    email: req.body.email,
    sex: req.body.sex,
    birthday: req.body.birthday
  },
    { where: { id: req.body.idUser } }
  )
    .then(() => {
      res.send({ message: "El usuario ha sido actualizado con éxito" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updatePass = (req, res) => {
  User.findOne({
    where: {
      id: req.body.idUser
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Usuario no encontrado." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.actualPass,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Contraseña actual incorrecta."
        });
      }

      // Genera una nueva contraseña hash
      const nuevaPasswordHash = bcrypt.hashSync(req.body.newPass, 8);

      // Actualiza la contraseña en la base de datos
      user.update({
        password: nuevaPasswordHash
      })
        .then(() => {
          res.status(200).send({ message: "Contraseña actualizada con éxito." });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
