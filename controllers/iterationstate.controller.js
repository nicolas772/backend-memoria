const db = require("../models");
const IterationState = db.iterationstate;
const Iteration = db.iteration
const Task = db.task

exports.getNextTaskForStudy = async (req, res) => {
  try {
    const iterationId = req.query.idIteration
    const userId = req.query.idUser
    const iterationState = await IterationState.findOne({ where: { iterationId: iterationId, userId: userId } })
    let LastTaskId, inTask = false, inCSUQ = false, inQuestion = false, lastTaskForCont = 1
    if (!iterationState) {
      // Si no se encuentra, crea un nuevo registro
      inTask = true
      LastTaskId = await Task.min('id', {
        where: {
          iterationId: iterationId
        }
      });
      await IterationState.create({
        iterationId: iterationId,
        userId: userId,
        taskId: LastTaskId,
        lastTaskForContador: lastTaskForCont
      });
      //actualizar +1 user_qty en la iteration
      const iteration = await Iteration.findOne({ where: { id: iterationId } })
      iteration.users_qty += 1
      await iteration.save()
    } else {
      LastTaskId = iterationState.taskId
      inTask = iterationState.inTask
      inCSUQ = iterationState.inCSUQ
      inQuestion = iterationState.inQuestion
      lastTaskForCont = iterationState.lastTaskForContador
    }

    const responseData = {
      nextTask: LastTaskId,
      inTask: inTask,
      inCSUQ: inCSUQ,
      inQuestion: inQuestion,
      lastTaskForCont : lastTaskForCont,
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  }
};