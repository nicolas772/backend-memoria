const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const IterationState = db.iterationstate
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize
const moment = require('moment');

const rangos = ["Niños", "Adolescentes", "Jovenes", "Adultos", "Adulto Mayores"]
const generos = ["Masculino", "Femenino", "No Informado"]
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

      const maleIds = await getIdsBySex(allUsersIdsStudy, "Masculino")
      const femaleIds = await getIdsBySex(allUsersIdsStudy, "Femenino")
      const noInformedIds = await getIdsBySex(allUsersIdsStudy, "No Informado")
      const users_qty_complete = maleIds.length + femaleIds.length + noInformedIds.length

      console.log("AQUI!!!")
      console.log(allUsersIdsStudy)

      const cantUsuarios = {
         title: "Cantidad Usuarios",
         metric: users_qty_complete,
         columnName1: "Género",
         columnName2: "Usuarios",
         data: [
            {
               name: "Masculino",
               stat: maleIds.length,
               icon: "hombre",
            },
            {
               name: "Femenino",
               stat: femaleIds.length,
               icon: "mujer",
            },
            {
               name: "No Informado",
               stat: noInformedIds.length,
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

      const allUsersByRange = await getUserIdsBySexAndRange(allUsersIdsStudy, "todos")
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

      const maleUsersByRange = await getUserIdsBySexAndRange(allUsersIdsStudy, "Masculino")
      const femaleUsersByRange = await getUserIdsBySexAndRange(allUsersIdsStudy, "Femenino")
      const noIdentificadoUsersByRange = await getUserIdsBySexAndRange(allUsersIdsStudy, "No Informado")

      const maleUsersByRangeQty = getUsersQtyByRange(maleUsersByRange)
      const femaleUsersByRangeQty = getUsersQtyByRange(femaleUsersByRange)
      const noIdentificadoUsersByRangeQty = getUsersQtyByRange(noIdentificadoUsersByRange)
      const chartData = [
         maleUsersByRangeQty,
         femaleUsersByRangeQty,
         noIdentificadoUsersByRangeQty,
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
         const maleUsersByRange = await getUserIdsBySexAndRange(allUserIds, "Masculino")
         const femaleUsersByRange = await getUserIdsBySexAndRange(allUserIds, "Femenino")
         const noIdentificadoUsersByRange = await getUserIdsBySexAndRange(allUserIds, "No Informado")

         const maleUsersByRangeQty = getUsersQtyByRange(maleUsersByRange)
         const femaleUsersByRangeQty = getUsersQtyByRange(femaleUsersByRange)
         const noIdentificadoUsersByRangeQty = getUsersQtyByRange(noIdentificadoUsersByRange)

         allUsersIdsByIteration.push({
            idIteration: idIteration,
            iteration: `Iteración ${iterationNumber}`,
            [generos[0]]: maleUsersByRangeQty,
            [generos[1]]: femaleUsersByRangeQty,
            [generos[2]]: noIdentificadoUsersByRangeQty
         });
         categories_2.push(`Iteración ${iterationNumber}`)
      }

      const series_2 = []
      const colors_2 = []
      //construccion de series
      for (const rango of rangos) {
         for (const genero of generos) {
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

async function getIdsBySex(allUserIds, sex) {
   try {
      const users = await User.findAll({
         where: {
            id: allUserIds,
            sex: sex,
         },
      });
      const userIds = users.map(user => user.id);
      return userIds;
   } catch (error) {
      console.error(error);
      throw new Error('Error al obtener usuarios por sexo y rango etario');
   }
}

async function getUserIdsBySexAndRange(allUserIds, sexo) {
   try {
      let users
      if (sexo === "todos") {
         users = await User.findAll({
            attributes: ['id', 'birthday', 'sex'],
            where: {
               id: allUserIds,
            },
         });
      } else {
         users = await User.findAll({
            attributes: ['id', 'birthday', 'sex'],
            where: {
               id: allUserIds,
               sex: sexo,
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
      result.name = sexo
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
      throw new Error('Error al obtener usuarios por sexo y rango etario');
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