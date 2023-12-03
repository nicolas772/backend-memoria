const db = require("../models");
const { Op } = require('sequelize');
const InfoTask = db.infotask;
const Task = db.task
const IterationState = db.iterationstate

exports.create = (req, res) => {
  // Save new Study to Database
  InfoTask.create({
    complete: req.body.complete,
    duration: req.body.duration,
    userId: req.body.iduser,
    taskId: req.body.idtask,
    iterationId: req.body.iditeration
  })
    .then(async () => {
      //aqui puedo setear la siguiente tarea en iterationstate
      let finish, nextTask, nextTaskForCont
      const LastTaskId = await Task.min('id', {
        where: {
          iterationId: req.body.iditeration,
          id: { [Op.gt]: req.body.idtask }
        }
      });
      const iterationState = await IterationState.findOne({ where: { iterationId: req.body.iditeration, userId: req.body.iduser } })
      if (LastTaskId){
        iterationState.taskId = LastTaskId
        iterationState.lastTaskForContador += 1
        await iterationState.save()
        finish = false
        nextTask = LastTaskId
        nextTaskForCont = iterationState.lastTaskForContador
      }else {
        iterationState.inTask = false
        iterationState.inCSUQ = true
        await iterationState.save()
        finish = true
        nextTask = 0
        nextTaskForCont = 0
      }
      res.send({ 
        finish: finish,
        nextTask: nextTask,
        nextTaskForCont: nextTaskForCont
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};