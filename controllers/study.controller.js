const db = require("../models");
const Study = db.study;
const Iteration = db.iteration;
const Task = db.task

exports.create = (req, res) => {
  // Save new Study to Database
  Study.create({
    software_name: req.body.softwareName,
    software_tipe: req.body.softwareType,
    url: req.body.softwareUrl,
    userId: req.body.testerId,
    start_date: req.body.startDate,
    end_date: req.body.endDate,
  })
    .then(() => {
      res.send({ message: "El estudio ha sido creado con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updateStudy= (req, res) => {
  // Save new Study to Database
  Study.update({
    software_name: req.body.softwareName,
    software_tipe: req.body.softwareType,
    url: req.body.softwareUrl,
    start_date: req.body.startDate,
    end_date: req.body.endDate,
  },
    { where: { id: req.body.idstudy } }
  )
    .then(() => {
      res.send({ message: "El estudio ha sido modificado con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getStudies = (req, res) => {
  const testerId = req.headers['id']; // Obtener el valor de la cabecera user-id
  Study.findAll({
    where:{
      userId: testerId,
    }
  })
  .then(studies => {
    res.status(200).json(studies); // Enviar una respuesta JSON con los estudios encontrados
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
  });
};

exports.getStudy = (req, res) => {
  const studyId= req.query.id; // Obtener el valor de la cabecera user-id
  Study.findOne({
    where:{
      id: studyId
    }
  })
  .then(study => {
    res.status(200).json(study)
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
  })
};

exports.deleteStudy = (req, res) => {
  const studyId = req.query.idStudy
  //eliminar tareas de la iteracion
  Study.destroy({
    where: { id: studyId }
  })
  .then((study) => {
    res.status(200).json(study)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  });
}