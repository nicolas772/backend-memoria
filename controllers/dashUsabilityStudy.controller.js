const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const CsuqAnswers = db.csuqanswers
const Study = db.study;
const { sequelize } = db; // Asegúrate de importar sequelize correctamente.

exports.cards = async (req, res) => {
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

      const arr_avg_intqual = []
      const arr_avg_infoqual = []
      const arr_avg_sysuse = []
      const arr_avg_scoresus = []

      let avg_intqual = 0
      let avg_infoqual = 0
      let avg_sysuse = 0
      let avg_scoresus = 0

      let intqual = 0
      let infoqual = 0
      let sysuse = 0
      let scoresus = 0

      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const allAnswers = await CsuqAnswers.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allAnswersQty = allAnswers.length

         intqual = 0
         infoqual = 0
         sysuse = 0
         scoresus = 0

         for (const answer of allAnswers) {
            scoresus += answer.scoresus
            intqual += answer.avgintqual
            infoqual += answer.avginfoqual
            sysuse += answer.avgsysuse
         }

         avg_intqual = 0
         avg_infoqual = 0
         avg_sysuse = 0
         avg_scoresus = 0

         if (allAnswersQty > 0) {
            avg_intqual = intqual / allAnswersQty
            avg_infoqual = infoqual / allAnswersQty
            avg_sysuse = sysuse / allAnswersQty
            avg_scoresus = scoresus / allAnswersQty
            arr_avg_intqual.push(avg_intqual)
            arr_avg_infoqual.push(avg_infoqual)
            arr_avg_sysuse.push(avg_sysuse)
            arr_avg_scoresus.push(avg_scoresus)
         }
      }

      const avg_arr_avg_intqual = calcularPromedio(arr_avg_intqual)
      const avg_arr_avg_infoqual = calcularPromedio(arr_avg_infoqual)
      const avg_arr_avg_sysuse = calcularPromedio(arr_avg_sysuse)
      const avg_arr_avg_scoresus = calcularPromedio(arr_avg_scoresus)

      const responseData = {
         promedio_scoresus: avg_arr_avg_scoresus + "%",
         promedio_intqual: avg_arr_avg_intqual + " / 7",
         promedio_infoqual: avg_arr_avg_infoqual + " / 7",
         promedio_sysuse: avg_arr_avg_sysuse + " / 7"
      };

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

      const chartData = []

      let avg_intqual = 0
      let avg_infoqual = 0
      let avg_sysuse = 0
      let avg_total = 0

      let intqual = 0
      let infoqual = 0
      let sysuse = 0
      let total = 0

      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const iterationNumber = iteration.iteration_number
         const allAnswers = await CsuqAnswers.findAll({
            where: {
               iterationId: idIteration,
            }
         })
         const allAnswersQty = allAnswers.length

         intqual = 0
         infoqual = 0
         sysuse = 0
         total = 0

         for (const answer of allAnswers) {
            total += answer.avgtotal
            intqual += answer.avgintqual
            infoqual += answer.avginfoqual
            sysuse += answer.avgsysuse
         }

         avg_intqual = 0
         avg_infoqual = 0
         avg_sysuse = 0
         avg_total = 0

         if (allAnswersQty > 0) {
            avg_intqual = intqual / allAnswersQty
            avg_infoqual = infoqual / allAnswersQty
            avg_sysuse = sysuse / allAnswersQty
            avg_total = total / allAnswersQty
            chartData.push({
               name: `Iteración ${iterationNumber}`,
               "Promedio Total": avg_total.toFixed(1),
               "Promedio Interfaz Quality": avg_intqual.toFixed(1),
               "Promedio Info Quality": avg_infoqual.toFixed(1),
               "Promedio Sys Use": avg_sysuse.toFixed(1)
            })
         }
      }

      const colors = ["green", "yellow", "blue", "orange"];
      const categories = [
         "Promedio Total",
         "Promedio Interfaz Quality",
         "Promedio Info Quality",
         "Promedio Sys Use"
      ];

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

exports.boxPlot = async (req, res) => {
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

      const data = []

      for (const iteration of allIterations) {
         const idIteration = iteration.id;
         const iterationNumber = iteration.iteration_number

         const allAnswers = await CsuqAnswers.findAll({
            where: {
               iterationId: idIteration,
            }
         })
   
         const avg_total = []
   
         if (allAnswers.length > 0) {
            for (const answer of allAnswers) {
               avg_total.push(answer.avgtotal)
            }
            const serie_avg_total = calcularEstadisticas(avg_total)
            data.push({
               x: `Iteración ${iterationNumber}`,
               y: serie_avg_total
            })
         }
      }

      const series = [
         {
            type: 'boxPlot',
            data: data,
         }
      ]

      const responseData = {
         series: series
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

function calcularPromedio(arr) {
   if (arr.length === 0) {
      return 0; // Manejar el caso de un array vacío para evitar dividir por cero
   }

   const suma = arr.reduce((total, elemento) => total + elemento, 0);
   const promedio = suma / arr.length;

   return promedio.toFixed(1);
}

// Función para calcular los cuartiles, valor máximo y valor mínimo
function calcularEstadisticas(arr) {
   if (arr.length === 0) {
      console.log("El array está vacío. No se pueden calcular estadísticas.");
      return []; // o cualquier otro valor que indique un resultado no válido
   }
   var sortedArray = arr.slice().sort(function (a, b) {
      return a - b;
   });

   var length = sortedArray.length;
   var q1 = sortedArray[Math.floor(length * 0.25)];
   var q2 = sortedArray[Math.floor(length * 0.5)]; // Mediana
   var q3 = sortedArray[Math.floor(length * 0.75)];
   var minValue = sortedArray[0];
   var maxValue = sortedArray[length - 1];
   const arr_final = [
      minValue.toFixed(1),
      q1.toFixed(1),
      q2.toFixed(1),
      q3.toFixed(1),
      maxValue.toFixed(1)
   ]
   return arr_final;
}
