const db = require("../models");
const Iteration = db.iteration;
const Study = db.study;
const Task = db.task

exports.create = (req, res) => {
  // Save new Study to Database
  Iteration.create({
    start_date: req.body.startDate,
    end_date: req.body.endDate,
    goal: req.body.objetivo,
    studyId: req.body.idstudy,
  })
    .then(() => {
      res.send({ message: "La iteración ha sido creada con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updateIteration = (req, res) => {
  // Save new Study to Database
  Iteration.update({
    start_date: req.body.startDate,
    end_date: req.body.endDate,
    goal: req.body.objetivo,
  },
    { where: { id: req.body.iditeration } }
  )
    .then(() => {
      res.send({ message: "La iteracion ha sido modificada con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getIterations = (req, res) => {
  const studyId = req.query.idStudy;
  Iteration.findAll({
    where: {
      studyId: studyId,
    }
  })
    .then(iterations => {
      res.status(200).json(iterations); // Enviar una respuesta JSON con los estudios encontrados
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    });
};

exports.getIteration = (req, res) => {
  const iterationId = req.query.idIteration; // Obtener el valor de la cabecera user-id
  Iteration.findOne({
    where: {
      id: iterationId
    }
  })
    .then(async (iteration) => {
      //aqui rescatar el titulo del estudio con iteration.studyId, y enviarlo en la response
      const study = await Study.findByPk(iteration.studyId)
      const software_name = study.software_name
      const response = {
        ...iteration.toJSON(),
        software_name: software_name
      };
      res.status(200).json(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    })
};

exports.getIterationWithDataStudy = async (req, res) => {
  try {
    const iterationId = req.query.idIteration;
    const iteration = await Iteration.findOne({ where: { id: iterationId } });
    const studyId = iteration.studyId;
    const study = await Study.findByPk(studyId);

    const responseData = {
      iteration: iteration,
      study: study
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  }
};

exports.deleteIteration = (req, res) => {
  const studyId = req.query.idStudy
  const iterationId = req.query.idIteration

  Iteration.findByPk(iterationId)
    .then(async (iteration) => {
      if (!iteration) {
        return res.status(404).send({ message: "Iteración no encontrada." });
      }

      const iterationState = iteration.state;
      const iterationNumber = iteration.iteration_number

      iteration.destroy()
        .then(async () => {
          const study = await Study.findByPk(studyId);

          if (iterationState === "Activa") {
            study.active_iteration_qty -= 1;
          }
          study.iteration_qty -= 1
          const max_iteration_number = study.max_iteration_number

          if (iterationNumber === max_iteration_number) {
            const allIterations = await Iteration.findAll({
              where: {
                studyId: studyId,
              },
            });

            if (!allIterations) {
              return res.status(404).json({ error: "Estudio no encontrado." });
            }

            let new_max_iteration_number = 0;

            for (const iteration of allIterations) { 
              const iterationNumber_aux = iteration.iteration_number
              if (iterationNumber_aux > new_max_iteration_number) {
                new_max_iteration_number = iterationNumber_aux
              }
            }
            study.max_iteration_number = new_max_iteration_number
          }

          await study.save();
          res.send({ message: "La iteración ha sido eliminada con éxito!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.setStateIteration = (req, res) => {
  const studyId = req.body.idStudy
  const newState = req.body.state;
  Iteration.update({
    state: newState,
  },
    { where: { id: req.body.iditeration } }
  )
    .then(async () => {
      const study = await Study.findByPk(studyId)
      if (newState === "Finalizada") {
        study.active_iteration_qty -= 1;
      } else if (newState === "Activa") {
        study.active_iteration_qty += 1;
      }
      await study.save()
      res.send({ message: "La iteracion ha sido modificada con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


//esta no se usa
exports.deleteIteration2 = (req, res) => {
  const studyId = req.query.idStudy
  const iterationId = req.query.idIteration
  //eliminar tareas de la iteracion
  Task.destroy({
    where: {
      iterationId: iterationId
    }
  })
    .then(async (iteration) => {
      //disminuir iteration qty
      const study = await Study.findByPk(studyId)
      study.iteration_qty -= 1
      await study.save()

      //eliminar iteracion
      await Iteration.destroy({
        where: {
          id: iterationId
        }
      })
      res.status(200).json(iteration)
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    })
}
