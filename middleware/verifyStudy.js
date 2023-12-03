const db = require("../models");
const Study = db.study;

checkDuplicateStudyName = (req, res, next) => {
  // Username
  Study.findOne({
    where: {
      software_name: req.body.softwareName,
      userId: req.body.testerId,
      software_tipe: req.body.softwareType,
    }
  }).then(study => {
    if (study) {
      res.status(400).send({
        message: "Este software ya tiene un estudio asociado. Por favor, crea una nueva iteracion dentro del estudio."
      });
      return;
    }
    next()
  });
};

const verifySignUp = {
  checkDuplicateStudyName: checkDuplicateStudyName,
};

module.exports = verifySignUp;