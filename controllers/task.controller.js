const db = require("../models");
const Task = db.task;
const Iteration = db.iteration
const Study = db.study

exports.create = (req, res) => {
  // Save new Study to Database
  Task.create({
    title: req.body.titulo,
    description: req.body.descripcion,
    dificulty: req.body.dificulty,
    minutes_optimal: req.body.minutes,
    seconds_optimal: req.body.seconds,
    iterationId: req.body.iditeration,
  })
    .then(() => {
      res.send({ message: "La tarea ha sido creada con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updateTask = (req, res) => {
  // Save new Study to Database
  Task.update({
    title: req.body.titulo,
    description: req.body.descripcion,
    dificulty: req.body.dificulty,
    minutes_optimal: req.body.minutes,
    seconds_optimal: req.body.seconds,
  },
    { where: { id: req.body.idtask } }
  )
    .then(() => {
      res.send({ message: "La tarea ha sido modificada con éxito!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getTasks = (req, res) => {
  const iterationId = req.query.idIteration;
  Task.findAll({
    where: {
      iterationId: iterationId,
    }
  })
    .then(tasks => {
      res.status(200).json(tasks); // Enviar una respuesta JSON con los estudios encontrados
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    });
};

exports.getTask = (req, res) => {
  const taskId = req.query.idTask; // Obtener el valor de la cabecera user-id
  Task.findOne({
    where: {
      id: taskId
    }
  })
    .then(async (task) => {
      const iteration = await Iteration.findByPk(task.iterationId)
      const iteration_number = iteration.iteration_number
      const iteration_state = iteration.state
      const study = await Study.findByPk(iteration.studyId)
      const software_name = study.software_name
      const response = {
        ...task.toJSON(),
        software_name: software_name,
        iteration_number: iteration_number,
        iteration_state: iteration_state,
      };
      res.status(200).json(response)
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    })
};

exports.deleteTask = (req, res) => {
  const taskId = req.query.idTask
  const iterationId = req.query.idIteration
  Task.destroy({
    where: {
      id: taskId
    }
  })
    .then(async (task) => {
      //disminuir task qty
      const iteration = await Iteration.findByPk(iterationId)
      iteration.task_qty -= 1
      await iteration.save()
      res.status(200).json(task)
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor'); // Enviar una respuesta de error si ocurre algún problema en la consulta
    })
}
