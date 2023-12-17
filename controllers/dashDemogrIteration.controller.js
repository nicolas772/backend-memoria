const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const IterationState = db.iterationstate
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize
const moment = require('moment');

const rangos = ["Niños", "Adolescentes", "Jovenes", "Adultos", "Adulto Mayores"]

exports.cards = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allIterationStates = await IterationState.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allIterationStates || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      //CARD 1: Cantidad usuarios

      const users_qty_complete = iteration.users_qty_complete
      const allUserIds = allIterationStates.map(iterationState => {
         if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
            return iterationState.userId
         }
      });
      const basicIds = await getIdsByLevel(allUserIds, "Básico")
      const mediumIds = await getIdsByLevel(allUserIds, "Medio")
      const advancedIds = await getIdsByLevel(allUserIds, "Avanzado")

      const cantUsuarios = {
         title: "Cantidad Usuarios",
         metric: users_qty_complete,
         columnName1: "Conocimiento Tecnológico",
         columnName2: "Usuarios",
         data: [
            {
               name: "Básico",
               stat: basicIds.length,
               icon: "hombre",
            },
            {
               name: "Medio",
               stat: mediumIds.length,
               icon: "mujer",
            },
            {
               name: "Avanzado",
               stat: advancedIds.length,
               icon: "noIdentificado"
            },
         ]
      };

      const responseData = {
         cantidad_usuarios: cantUsuarios,
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
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allIterationStates = await IterationState.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allIterationStates || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const allUserIds = allIterationStates.map(iterationState => {
         if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
            return iterationState.userId
         }
      });

      const allUsersByRange = await getUserIdsByLevelAndRange(allUserIds, "todos")
      const series = [
         allUsersByRange[rangos[0]].length,
         allUsersByRange[rangos[1]].length,
         allUsersByRange[rangos[2]].length,
         allUsersByRange[rangos[3]].length,
         allUsersByRange[rangos[4]].length,
      ]
      const colors = ['#28a745', '#ffc108', '#6f42c1', '#007bff', '#fd7e14']

      const responseData = {
         series: series,
         labels: rangos,
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
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allIterationStates = await IterationState.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allIterationStates || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const allUserIds = allIterationStates.map(iterationState => {
         if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
            return iterationState.userId
         }
      });

      const basicUsersByRange = await getUserIdsByLevelAndRange(allUserIds, "Básico")
      const mediumUsersByRange = await getUserIdsByLevelAndRange(allUserIds, "Medio")
      const advancedUsersByRange = await getUserIdsByLevelAndRange(allUserIds, "Avanzado")

      const basicUsersByRangeQty = getUsersQtyByRange(basicUsersByRange)
      const mediumUsersByRangeQty = getUsersQtyByRange(mediumUsersByRange)
      const advancedUsersByRangeQty = getUsersQtyByRange(advancedUsersByRange)
      const chartData = [
         basicUsersByRangeQty,
         mediumUsersByRangeQty,
         advancedUsersByRangeQty,
      ]
      const colors = ["green", "yellow", "purple", "blue", "orange"];

      const responseData = {
         chartData: chartData,
         colors: colors,
         categories: rangos,
      };
      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

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

async function getUserIdsByLevelAndRange(allUserIds, level) {
   try {
      let users
      if (level === "todos") {
         users = await User.findAll({
            attributes: ['id', 'birthday', 'level'],
            where: {
               id: allUserIds,
            },
         });
      } else {
         users = await User.findAll({
            attributes: ['id', 'birthday', 'level'],
            where: {
               id: allUserIds,
               level: level,
            },
         });
      }

      const result = {
         [rangos[0]]: [],
         [rangos[1]]: [],
         [rangos[2]]: [],
         [rangos[3]]: [],
         [rangos[4]]: [],
      };
      result.name = level
      const currentDate = moment();

      users.forEach((user) => {
         const age = currentDate.diff(moment(user.birthday), 'years');

         if (age <= 13) {
            result[rangos[0]].push(user.id);
         } else if (age <= 18) {
            result[rangos[1]].push(user.id);
         } else if (age <= 35) {
            result[rangos[2]].push(user.id);
         } else if (age <= 60) {
            result[rangos[3]].push(user.id);
         } else {
            result[rangos[4]].push(user.id);
         }
      });

      return result;
   } catch (error) {
      console.error(error);
      throw new Error('Error al obtener usuarios por nivel y rango etario');
   }
}

function getUsersQtyByRange(usuariosPorRango) {
   const usuariosPorRangoConCantidad = {};

   for (const [key, value] of Object.entries(usuariosPorRango)) {
      if (Array.isArray(value)) {
         if (value.length > 0){
            usuariosPorRangoConCantidad[key] = value.length;
         }
      } else {
         usuariosPorRangoConCantidad[key] = value;
      }
   }
   return usuariosPorRangoConCantidad
}