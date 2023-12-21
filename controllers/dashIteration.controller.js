const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize

exports.cards = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allTasks = await Task.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allTasks || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      //CARD 1: Tiempo Promedio
      const allTaskIds = allTasks.map(task => task.id);
      const easyTask = allTasks.filter(task => task.dificulty === "Fácil");
      const easyTaskIds = easyTask.map(task => task.id);
      const mediumTask = allTasks.filter(task => task.dificulty === "Medio");
      const mediumTaskIds = mediumTask.map(task => task.id);
      const hardTask = allTasks.filter(task => task.dificulty === "Difícil");
      const hardTaskIds = hardTask.map(task => task.id);

      //const avgTask = await calculateAvgDuration(allTaskIds);
      const avgEasyTask = await calculateAvgDuration(easyTaskIds);
      const avgMediumTask = await calculateAvgDuration(mediumTaskIds);
      const avgHardTask = await calculateAvgDuration(hardTaskIds);

      const avgIteration = await calculateAvgIteration(idIteration)

      const avgTime = {
         title: "Tiempo Promedio de Iteración",
         metric: formatTime(avgIteration),
         columnName1: "Dificultad Tarea",
         columnName2: "Tiempo Promedio",
         data: [
            {
               name: "Fácil",
               stat: formatTime(avgEasyTask),
               icon: "facil",
            },
            {
               name: "Medio",
               stat: formatTime(avgMediumTask),
               icon: "medio",
            },
            {
               name: "Dificil",
               stat: formatTime(avgHardTask),
               icon: "dificil"
            },
         ]
      };

      //CARD 2: Porcentaje Tareas Completadas

      const completePrcTask = await calculateCompletePercentage(allTaskIds);
      const completePrcEasyTask = await calculateCompletePercentage(easyTaskIds);
      const completePrcMediumTask = await calculateCompletePercentage(mediumTaskIds);
      const completePrcHardTask = await calculateCompletePercentage(hardTaskIds);

      const completePercentage = {
         title: "Porcentaje Tareas Completadas",
         metric: completePrcTask,
         columnName1: "Dificultad Tarea",
         columnName2: "Porcentaje",
         data: [
            {
               name: "Fácil",
               stat: completePrcEasyTask,
               icon: "facil",
            },
            {
               name: "Medio",
               stat: completePrcMediumTask,
               icon: "medio",
            },
            {
               name: "Dificil",
               stat: completePrcHardTask,
               icon: "dificil"
            },
         ]
      };

      const responseData = {
         tiempo_promedio: avgTime,
         tareas_completadas: completePercentage,
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.tableTime = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const allTasks = await Task.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allTasks) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const responseData = []

      for (const task of allTasks) {
         const idTask = task.id
         const name = task.title
         const minutesOptimal = task.minutes_optimal
         const secondsOptimal = task.seconds_optimal
         const tasks = await InfoTask.findAll({
            where: {
               taskId: idTask,
            },
         });
         if (tasks.length > 0) {
            const taskQty = tasks.length
            const averageDuration = tasks.reduce((total, task) => total + task.duration, 0) / taskQty;
            const roundedAverageDuration = Math.round(averageDuration / 1000) * 1000;
            const optTime = minutesSecondsToMilliseconds(minutesOptimal, secondsOptimal);
            const diference = roundedAverageDuration - optTime
            responseData.push({
               name: name,
               avgTime: roundedAverageDuration,
               optTime: optTime,
               diference: diference,
            })
         } else {
            responseData.push({
               name: name,
               avgTime: 0,
               optTime: 0,
               diference: 0,
            })
         }
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.pieChart = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const allTasks = await Task.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allTasks) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      const easyTask = allTasks.filter(task => task.dificulty === "Fácil").length;
      const mediumTask = allTasks.filter(task => task.dificulty === "Medio").length;
      const hardTask = allTasks.filter(task => task.dificulty === "Difícil").length;

      const series = [easyTask, mediumTask, hardTask]
      const labels = ['Fácil', 'Medio', 'Difícil']
      const colors = ['#28a745', '#ffc108', '#dc3545']

      const responseData = {
         series: series,
         labels: labels,
         colors: colors
      }
      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.barChart = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const allTasks = await Task.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allTasks) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const chartData = []
      for (const task of allTasks) {
         const idTask = task.id
         const name = task.title
         const allInfoTasks = await InfoTask.findAll({
            where: {
               taskId: idTask,
            },
         });
         const info_task_qty = allInfoTasks.length
         const completedTask = allInfoTasks.filter(task => task.complete === true).length;
         const incompletedTask = info_task_qty - completedTask
         chartData.push({
            name: name,
            "Usuarios que Completaron": completedTask,
            "Usuarios que No Completaron": incompletedTask
         })
      }

      const colors = ["emerald", "rose"];
      const categories = ["Usuarios que Completaron", "Usuarios que No Completaron"];

      const responseData = {
         chartData: chartData,
         colors: colors,
         categories: categories,
      };
      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

/*
exports.cards = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allTasks = await Task.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allTasks || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      //CARD 1: Total Iteraciones
      const total_task = allTasks.length
      const easyTask = allTasks.filter(task => task.dificulty === "Fácil").length;
      const mediumTask = allTasks.filter(task => task.dificulty === "Medio").length;
      const hardTask = allTasks.filter(task => task.dificulty === "Difícil").length;


      const totalTask = {
         title: "Total Tareas",
         metric: total_task,
         columnName1: "Dificultad",
         columnName2: "Tareas",
         data: [
            {
               name: "Fácil",
               stat: easyTask,
               icon: "facil",
            },
            {
               name: "Medio",
               stat: mediumTask,
               icon: "medio",
            },
            {
               name: "Dificil",
               stat: hardTask,
               icon: "dificil"
            },
         ]
      };

      //CARD 2: Total Usuarios
      const users_active = iteration.users_qty
      const users_complete = iteration.users_qty_complete
      const total_users = users_active + users_complete

      const totalUsers = {
         title: "Total Usuarios",
         metric: total_users,
         columnName1: "Estado Usuarios",
         columnName2: "Usuarios",
         data: [
            {
               name: "En proceso",
               stat: users_active,
               icon: "proceso",
            },
            {
               name: "Finalizados",
               stat: users_complete,
               icon: "finalizado",
            }
         ]
      };

      const responseData = {
         total_tareas: totalTask,
         total_usuarios: totalUsers,
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};
*/

function minutesSecondsToMilliseconds(minutes, seconds) {
   const totalSeconds = minutes * 60 + seconds;
   return totalSeconds * 1000; // Convertir segundos a milisegundos
}

// Función para convertir milisegundos a "m minutos s segundos"
function formatTime(milliseconds) {
   const totalSeconds = Math.floor(milliseconds / 1000);
   const minutes = Math.floor(totalSeconds / 60);
   const remainingSeconds = totalSeconds % 60;
   return `${minutes}m ${remainingSeconds}s`;
}

// Función para calcular el tiempo promedio de duración
async function calculateAvgDuration(taskIds) {
   if (taskIds.length === 0) {
      return 0;
   }

   // Obtener las InfoTasks correspondientes a los ids de las tareas
   const allInfoTasks = await InfoTask.findAll({
      where: {
         taskId: {
            [Op.in]: taskIds,
         },
      },
   });

   if (allInfoTasks.length === 0) {
      return 0;
   }

   const totalDuration = allInfoTasks.reduce((total, task) => total + task.duration, 0);
   const avgDuration = totalDuration / allInfoTasks.length;
   const roundedAverageDuration = Math.round(avgDuration / 1000) * 1000;
   return roundedAverageDuration
}

// Función para calcular el tiempo promedio de duración de la iteracion
async function calculateAvgIteration(iterationId) {
   const userSet = new Set();
   // Obtener las InfoTasks correspondientes a los ids de las tareas
   const tasks = await InfoTask.findAll({
      where: {
         iterationId: iterationId
      },
   });

   if (tasks.length === 0) {
      return 0;
   }

   // Calcula la cantidad de usuarios únicos que realizaron tareas
   tasks.forEach(task => userSet.add(task.userId));
   const usersQty_iteration = userSet.size
   // Calcula el tiempo promedio de las tareas
   const averageDuration = tasks.reduce((total, task) => total + task.duration, 0) / usersQty_iteration;
   // Aproxima a la unidad de mil más cercana
   const roundedAverageDuration = Math.round(averageDuration / 1000) * 1000;
   return roundedAverageDuration
   
}

// Función para calcular el procentaje completado de tareas
async function calculateCompletePercentage(taskIds) {
   if (taskIds.length === 0) {
      return 0;
   }

   // Obtener las InfoTasks correspondientes a los ids de las tareas
   const allInfoTasks = await InfoTask.findAll({
      where: {
         taskId: {
            [Op.in]: taskIds,
         },
      },
   });

   if (allInfoTasks.length === 0) {
      return 0;
   }

   const total_task_qty = allInfoTasks.length
   const completed_task_qty = allInfoTasks.filter(task => task.complete === true).length;
   const percentageTaskComplete = completed_task_qty / total_task_qty
   const porcentaje = (percentageTaskComplete * 100).toFixed(1) + "%";
   return (porcentaje)
}
