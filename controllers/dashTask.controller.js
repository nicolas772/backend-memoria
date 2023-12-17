const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize
const moment = require('moment');

const rango1 = "Niños";
const rango2 = "Adolescentes";
const rango3 = "Jovenes";
const rango4 = "Adultos";
const rango5 = "Adulto Mayores";

exports.cards = async (req, res) => {
   const idTask = req.query.idTask;
   try {
      const task = await Task.findOne({
         where: {
            id: idTask
         }
      })
      const allInfoTasks = await InfoTask.findAll({
         where: {
            taskId: idTask,
         }
      })

      if (!allInfoTasks || !task) {
         return res.status(404).json({ error: "Tarea No Encontrada." });
      }
      const info_task_qty = allInfoTasks.length


      //CARD 3: Tiempo Optimo

      const minutesOptimal = task.minutes_optimal
      const secondsOptimal = task.seconds_optimal
      const optimalTime = minutesOptimal + "m " + secondsOptimal + "s"
      let responseData

      if (info_task_qty > 0) {
         //CARD 1: Porcentaje de éxito de tarea
         const completedTasks = allInfoTasks.filter(task => task.complete === true).length;
         const avgSuccessNoFormat =  completedTasks / info_task_qty
         const avgSuccess = (avgSuccessNoFormat * 100).toFixed(1) + "%";

         //CARD 2: Tiempo promedio de tarea

         const totalDuration = allInfoTasks.reduce((total, task) => total + task.duration, 0);
         const avgDuration = totalDuration / info_task_qty;
         const roundedAverageDuration = Math.round(avgDuration / 1000) * 1000;

         //CARD 4: Diferencia Tiempo

         const optTimeMili = minutesSecondsToMilliseconds(minutesOptimal, secondsOptimal);
         const diference = Math.abs(roundedAverageDuration - optTimeMili)
         responseData = {
            porcentaje_exito: avgSuccess,
            tiempo_promedio: formatTime(roundedAverageDuration),
            tiempo_optimo: optimalTime,
            diferencia: formatTime(diference)
         };
      } else {
         responseData = {
            porcentaje_exito: "0%",
            tiempo_promedio: formatTime(0),
            tiempo_optimo: optimalTime,
            diferencia: formatTime(0)
         };
      }
      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.barChart = async (req, res) => {
   const idTask = req.query.idTask;
   try {
      const task = await Task.findOne({
         where: {
            id: idTask
         }
      })
      const allInfoTasks = await InfoTask.findAll({
         where: {
            taskId: idTask,
         }
      })

      if (!allInfoTasks || !task) {
         return res.status(404).json({ error: "Tarea No Encontrada." });
      }

      //BAR CHART % exito por rango etario y nivel
      const allUserIds = allInfoTasks.map(task => task.userId);
      const completedTask = allInfoTasks.filter(task => task.complete === true);
      const completedTaskUserIds = completedTask.map(task => task.userId);
      const basicUserIds = await getUserIdsByLevelAndRange(allUserIds, "Básico")
      const mediumUserIds = await getUserIdsByLevelAndRange(allUserIds, "Medio")
      const advancedUserIds = await getUserIdsByLevelAndRange(allUserIds, "Avanzado")
      const basicUserIdsCompleted = await getUserIdsByLevelAndRange(completedTaskUserIds, "Básico")
      const mediumUserIdsCompleted = await getUserIdsByLevelAndRange(completedTaskUserIds, "Medio")
      const advancedUserIdsCompleted = await getUserIdsByLevelAndRange(completedTaskUserIds, "Avanzado")

      const successBasic = getSuccessPercentage(basicUserIdsCompleted, basicUserIds, "Básico")
      const successMedium = getSuccessPercentage(mediumUserIdsCompleted, mediumUserIds, "Medio")
      const successAdvanced = getSuccessPercentage(advancedUserIdsCompleted, advancedUserIds, "Avanzado")

      const chartData1 = [successBasic, successMedium, successAdvanced];

      //BAR CHART Tiempo promedio por rango etario y nivel

      const allUserTimes = allInfoTasks.map(task => ({
         userId: task.userId,
         time: task.duration
      }));
      const basicIds = await getIdsByLevel(allUserIds, "Básico")
      const mediumIds = await getIdsByLevel(allUserIds, "Medio")
      const advancedIds = await getIdsByLevel(allUserIds, "Avanzado")

      const basicUserTimes = allUserTimes.filter(userTime => basicIds.includes(userTime.userId));
      const mediumUserTimes = allUserTimes.filter(userTime => mediumIds.includes(userTime.userId));
      const advancedUserTimes = allUserTimes.filter(userTime => advancedIds.includes(userTime.userId));

      const avgTimeBasic = await getAvgTimeByRange(basicUserTimes, "Básico")
      const avgTimeMedium = await getAvgTimeByRange(mediumUserTimes, "Medio")
      const avgTimeAdvanced = await getAvgTimeByRange(advancedUserTimes, "Avanzado")

      const chartData2 = [avgTimeBasic, avgTimeMedium, avgTimeAdvanced];

      const colors = ["emerald", "rose", "blue", "indigo", "yellow"];
      const categories = [rango1, rango2, rango3, rango4, rango5];
      const responseData = {
         chartData1: chartData1,
         chartData2: chartData2,
         colors: colors,
         categories: categories,
      };

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

// Función para convertir milisegundos a "m minutos s segundos"
function formatTime(milliseconds) {
   const totalSeconds = Math.floor(milliseconds / 1000);
   const minutes = Math.floor(totalSeconds / 60);
   const remainingSeconds = totalSeconds % 60;
   return `${minutes}m ${remainingSeconds}s`;
}

function minutesSecondsToMilliseconds(minutes, seconds) {
   const totalSeconds = minutes * 60 + seconds;
   return totalSeconds * 1000; // Convertir segundos a milisegundos
}

async function getUserIdsByLevelAndRange(allUserIds, level) {
   try {
      const users = await User.findAll({
         attributes: ['id', 'birthday', 'level'],
         where: {
            id: allUserIds,
            level: level, 
         },
      });

      const result = {
         [rango1]: [],
         [rango2]: [],
         [rango3]: [],
         [rango4]: [],
         [rango5]: [],
      };

      const currentDate = moment();

      users.forEach((user) => {
         const age = currentDate.diff(moment(user.birthday), 'years');

         if (age <= 13) {
            result[rango1].push(user.id);
         } else if (age <= 18) {
            result[rango2].push(user.id);
         } else if (age <= 35) {
            result[rango3].push(user.id);
         } else if (age <= 60) {
            result[rango4].push(user.id);
         } else {
            result[rango5].push(user.id);
         }
      });

      return result;
   } catch (error) {
      console.error(error);
      throw new Error('Error al obtener usuarios por nivel y rango etario');
   }
}

async function getIdsByLevel(allUserIds, level) {
   try {
      const users = await User.findAll({
         where: {
            id: allUserIds,
            level: level,
         },
      });
      const userIds = users.map(user => user.id);
      return userIds;
   } catch (error) {
      console.error(error);
      throw new Error('Error al obtener usuarios por nivel y rango etario');
   }
}

function getSuccessPercentage(userIdsCompleted, userIdsTotal, level) {
   try {
      const result = {};
      result.name = level
      if (userIdsTotal[rango1].length > 0) {
         result[rango1] = calculatePercentage(userIdsCompleted[rango1], userIdsTotal[rango1]);
      }

      if (userIdsTotal[rango2].length > 0) {
         result[rango2] = calculatePercentage(userIdsCompleted[rango2], userIdsTotal[rango2]);
      }

      if (userIdsTotal[rango3].length > 0) {
         result[rango3] = calculatePercentage(userIdsCompleted[rango3], userIdsTotal[rango3]);
      }

      if (userIdsTotal[rango4].length > 0) {
         result[rango4] = calculatePercentage(userIdsCompleted[rango4], userIdsTotal[rango4]);
      }

      if (userIdsTotal[rango5].length > 0) {
         result[rango5] = calculatePercentage(userIdsCompleted[rango5], userIdsTotal[rango5]);
      }

      return result;
   } catch (error) {
      console.error(error);
      throw new Error('Error al calcular la tasa de éxito por rango etario');
   }
}

function calculatePercentage(completedIds, totalIds) {
   if (totalIds.length === 0) {
      // Si el largo del array del rango etario del segundo parámetro es 0, no considerar el rango etario
      return null;
   }

   const successPercentage = (completedIds.length / totalIds.length);
   return successPercentage;
}

async function getAvgTimeByRange(UserTimes, level) {
   try {
      const users = await User.findAll({
         attributes: ['id', 'birthday'],
         where: {
            id: UserTimes.map(userTime => userTime.userId),
         },
      });

      const currentDate = moment();

      const result = {
         [rango1]: [],
         [rango2]: [],
         [rango3]: [],
         [rango4]: [],
         [rango5]: [],
      };

      UserTimes.forEach(userTime => {
         const user = users.find(u => u.id === userTime.userId);
         if (user) {
            const age = currentDate.diff(moment(user.birthday), 'years');
            if (age <= 13) {
               result[rango1].push(userTime.time);
            } else if (age <= 18) {
               result[rango2].push(userTime.time);
            } else if (age <= 35) {
               result[rango3].push(userTime.time);
            } else if (age <= 60) {
               result[rango4].push(userTime.time);
            } else {
               result[rango5].push(userTime.time);
            }
         }
      });
      const roundToNearestThousand = value => Math.round(value / 1000) * 1000;

      const calculateAverage = arr => (
         arr.length > 0
            ? roundToNearestThousand(arr.reduce((sum, value) => sum + parseFloat(value), 0) / arr.length)
            : 0
      );
      
      const avgTime = {}
      avgTime.name = level
      
      if(result[rango1].length > 0){
         avgTime[rango1] = calculateAverage(result[rango1])
      }
      if(result[rango2].length > 0){
         avgTime[rango2] = calculateAverage(result[rango2])
      }
      if(result[rango3].length > 0){
         avgTime[rango3] = calculateAverage(result[rango3])
      }
      if(result[rango4].length > 0){
         avgTime[rango4] = calculateAverage(result[rango4])
      }
      if(result[rango5].length > 0){
         avgTime[rango5] = calculateAverage(result[rango5])
      }

      return avgTime;
   } catch (error) {
      console.error(error);
      throw new Error('Error al obtener el tiempo promedio por rango etario');
   }
}