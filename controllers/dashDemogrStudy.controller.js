const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const IterationState = db.iterationstate
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize
const moment = require('moment');

const rangos = ["Niños", "Adolescentes", "Jovenes", "Adultos", "Adulto Mayores"]
const niveles = ["Básico", "Medio", "Avanzado"]
const color_map_rangos = {
   [rangos[0]]: '#28a745',
   [rangos[1]]: '#ffc107',
   [rangos[2]]: '#6f42c1',
   [rangos[3]]: '#007bff',
   [rangos[4]]: '#fd7e14',


}

exports.cards = async (req, res) => {
   const idStudy = req.query.idStudy;
   try {
      //CARD 1: Cantidad usuarios

      const allIterations = await Iteration.findAll({
         where: {
            studyId: idStudy,
         }
      });

      if (!allIterations) {
         return res.status(404).json({ error: "Estudio no encontrado." });
      }

      const allUsersIdsStudy = []

      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const allIterationStates = await IterationState.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allUserIds = allIterationStates.map(iterationState => {
            if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
               return iterationState.userId
            }
         });
         allUsersIdsStudy.push(...allUserIds);
      }

      const basicIds = await getIdsByLevel(allUsersIdsStudy, niveles[0])
      const mediumIds = await getIdsByLevel(allUsersIdsStudy, niveles[1])
      const advancedIds = await getIdsByLevel(allUsersIdsStudy, niveles[2])
      const users_qty_complete = basicIds.length + mediumIds.length + advancedIds.length

      const cantUsuarios = {
         title: "Cantidad Usuarios",
         metric: users_qty_complete,
         columnName1: "Conocimiento Tecnológico",
         columnName2: "Usuarios",
         data: [
            {
               name: niveles[0],
               stat: basicIds.length,
               icon: "hombre",
            },
            {
               name: niveles[1],
               stat: mediumIds.length,
               icon: "mujer",
            },
            {
               name: niveles[2],
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
   const idStudy = req.query.idStudy;
   try {
      const allIterations = await Iteration.findAll({
         where: {
            studyId: idStudy,
         }
      });

      if (!allIterations) {
         return res.status(404).json({ error: "Estudio no encontrado." });
      }
      const result = {
         [rangos[0]]: 0,
         [rangos[1]]: 0,
         [rangos[2]]: 0,
         [rangos[3]]: 0,
         [rangos[4]]: 0,
      };

      const allUsersIdsStudy = []

      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const allIterationStates = await IterationState.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allUserIds = allIterationStates.map(iterationState => {
            if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
               return iterationState.userId
            }
         });
         allUsersIdsStudy.push(...allUserIds);
      }

      const allUsersByRange = await getUserIdsByLevelAndRange(allUsersIdsStudy, "todos")
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
   const idStudy = req.query.idStudy;
   try {
      const allIterations = await Iteration.findAll({
         where: {
            studyId: idStudy,
         }
      });

      if (!allIterations) {
         return res.status(404).json({ error: "Estudio no encontrado." });
      }

      const allUsersIdsStudy = []
      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const allIterationStates = await IterationState.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allUserIds = allIterationStates.map(iterationState => {
            if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
               return iterationState.userId
            }
         });
         allUsersIdsStudy.push(...allUserIds);
      }

      const basicUsersByRange = await getUserIdsByLevelAndRange(allUsersIdsStudy, niveles[0])
      const mediumUsersByRange = await getUserIdsByLevelAndRange(allUsersIdsStudy, niveles[1])
      const advancedUsersByRange = await getUserIdsByLevelAndRange(allUsersIdsStudy, niveles[2])

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

exports.stackedChart = async (req, res) => {
   const idStudy = req.query.idStudy;
   try {
      const allIterations = await Iteration.findAll({
         where: {
            studyId: idStudy,
         }
      });

      if (!allIterations) {
         return res.status(404).json({ error: "Estudio no encontrado." });
      }

      const allUsersIdsByIteration = []
      const categories_2 = []
      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const iterationNumber = iteration.iteration_number
         const allIterationStates = await IterationState.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allUserIds = allIterationStates.map(iterationState => {
            if (!iterationState.inTask && !iterationState.inCSUQ && !iterationState.inQuestion) {
               return iterationState.userId
            }
         });
         const basicUsersByRange = await getUserIdsByLevelAndRange(allUserIds, niveles[0])
         const mediumUsersByRange = await getUserIdsByLevelAndRange(allUserIds, niveles[1])
         const advancedUsersByRange = await getUserIdsByLevelAndRange(allUserIds, niveles[2])

         const basicUsersByRangeQty = getUsersQtyByRange(basicUsersByRange)
         const mediumUsersByRangeQty = getUsersQtyByRange(mediumUsersByRange)
         const advancedUsersByRangeQty = getUsersQtyByRange(advancedUsersByRange)

         allUsersIdsByIteration.push({
            idIteration: idIteration,
            iteration: `Iteración ${iterationNumber}`,
            [niveles[0]]: basicUsersByRangeQty,
            [niveles[1]]: mediumUsersByRangeQty,
            [niveles[2]]: advancedUsersByRangeQty
         });
         categories_2.push(`Iteración ${iterationNumber}`)
      }

      const series_2 = []
      const colors_2 = []
      //construccion de series
      for (const rango of rangos) {
         for (const genero of niveles) {
            const name = genero + " " + rango
            const data = []
            for (const iter of allUsersIdsByIteration) {
               const obj_genero = iter[genero]
               if (rango in obj_genero) {
                  data.push(obj_genero[rango])
               } else {
                  data.push(0)
               }
            }
            const todosSonCero = data.every(elemento => elemento === 0);
            if (!todosSonCero) {
               series_2.push({
                  name: name,
                  group: rango,
                  data: data
               })
               colors_2.push(color_map_rangos[rango])
            }
         }
      }

      const responseData = {
         series: series_2,
         colors: colors_2,
         categories: categories_2,
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
         if (value.length > 0) {
            usuariosPorRangoConCantidad[key] = value.length;
         }
      } else {
         usuariosPorRangoConCantidad[key] = value;
      }
   }
   return usuariosPorRangoConCantidad
}