const db = require("../models");
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
   // Username
   User.findOne({
      where: {
         username: req.body.username
      }
   }).then(user => {
      if (user) {
         if (user.id !== req.body.idUser) {
            res.status(400).send({
               message: "El usuario ingresado no está disponible"
            });
            return;
         }
      }

      // Email
      User.findOne({
         where: {
            email: req.body.email
         }
      }).then(user => {
         if (user) {
            if (user.id !== req.body.idUser) {
               res.status(400).send({
                  message: "El email ingresado no está disponible"
               });
               return;
            }
         }
         next();
      });
   });
};

const verifyProfile = {
   checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail
};

module.exports = verifyProfile;