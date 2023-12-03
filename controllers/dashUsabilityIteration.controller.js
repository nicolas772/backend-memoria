const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Study = db.study;
const CsuqAnswers = db.csuqanswers
const { sequelize } = db; // Asegúrate de importar sequelize correctamente.

exports.cards = async (req, res) => {
   const idIteration = req.query.idIteration;

   try {

      const allAnswers = await CsuqAnswers.findAll({
         where: {
            iterationId: idIteration,
         }
      })
      const allAnswersQty = allAnswers.length

      let intqual = 0
      let infoqual = 0
      let sysuse = 0
      let scoresus = 0

      for (const answer of allAnswers) {
         scoresus += answer.scoresus
         intqual += answer.avgintqual
         infoqual += answer.avginfoqual
         sysuse += answer.avgsysuse
      }

      let avg_intqual = 0
      let avg_infoqual = 0
      let avg_sysuse = 0
      let avg_scoresus = 0

      if (allAnswersQty > 0) {
         avg_intqual = intqual / allAnswersQty
         avg_infoqual = infoqual / allAnswersQty
         avg_sysuse = sysuse / allAnswersQty
         avg_scoresus = scoresus / allAnswersQty
      }

      const perc_avg_intqual = (avg_intqual / 7) * 100
      const perc_avg_infoqual = (avg_infoqual / 7) * 100
      const perc_avg_sysuse = (avg_sysuse / 7) * 100

      /*const responseData = {
         promedio_scoresus: avg_scoresus.toFixed(1) + "%",
         promedio_intqual: perc_avg_intqual.toFixed(1) + "%",
         promedio_infoqual: perc_avg_infoqual.toFixed(1) + "%",
         promedio_sysuse: perc_avg_sysuse.toFixed(1) + "%"
      };*/
      const responseData = {
         promedio_scoresus: avg_scoresus.toFixed(1) + "%",
         promedio_intqual: avg_intqual.toFixed(1) + " / 7",
         promedio_infoqual: avg_infoqual.toFixed(1) + " / 7",
         promedio_sysuse: avg_sysuse.toFixed(1) + " / 7"
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.tableAvg = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const allAnswers = await CsuqAnswers.findAll({
         where: {
            iterationId: idIteration,
         }
      })
      const allAnswersQty = allAnswers.length
      const questions = ["Pregunta 1", "Pregunta 2", "Pregunta 3", "Pregunta 4", "Pregunta 5", "Pregunta 6", "Pregunta 7", "Pregunta 8", "Pregunta 9", "Pregunta 10", "Pregunta 11", "Pregunta 12", "Pregunta 13", "Pregunta 14", "Pregunta 15", "Pregunta 16"];
      const preguntas = [
         '1. En general, estoy satisfecho con lo facil que es utilizar este software.',
         '2. Fue simple utilizar este software.',
         '3. Soy capaz de completar mi trabajo rápidamente utilizando este software.',
         '4. Me siento comodo utilizando este software.',
         '5. Fue fácil aprender a utilizar este software.',
         '6. Creo que me volví experto rapidamente utilizando este software.',
         '7. El software muestra mensajes de error que me dicen claramente cómo resolver los problemas.',
         '8. Cada vez que cometo un error utilizando el software, lo resuelvo fácil y rapidamente.',
         '9. La información (como ayuda en linea, mensajes en pantalla y otra documentación) que provee el software es clara.',
         '10. Es fácil encontrar en el software la información que necesito.',
         '11. La información que proporciona el software fue efectiva ayudándome a completar las tareas.',
         '12. La organización de la información del software en la pantalla fue clara.',
         '13. La interfaz del software fue placentera.',
         '14. Me gustó utilizar el software.',
         '15. El software tuvo todas las herramientas que esperaba que tuviera.',
         '16. En general, estuve satisfecho con el software.'
       ];
      
      const responseData = questions.map((question, index) => ({
         name: question,
         avg: 0,
         min: 0,
         max: 0,
         diference: 0,
         column: `answer${index + 1}`,
         index: index,
         enunciado: preguntas[index]
      }));

      if (allAnswersQty > 0) {
         for (const question of responseData) {
            const columnName = question.column
            let minimo = 8
            let maximo = -1
            let suma = 0
            for (const answer of allAnswers) {
               const value = answer[columnName]
               suma += value
               if (value > maximo) {
                  maximo = value
               }
               if (value < minimo) {
                  minimo = value
               }
            }
            question.min = minimo
            question.max = maximo
            question.diference = maximo - minimo
            question.avg = (suma / allAnswersQty).toFixed(1)
         }
      }

      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.boxPlot = async (req, res) => {
   const idIteration = req.query.idIteration;


   try {
      const allAnswers = await CsuqAnswers.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      const avg_total = []
      const avg_sysuse = []
      const avg_info = []
      const avg_interfaz = []

      if (allAnswers.length > 0) {
         for (const answer of allAnswers) {
            avg_total.push(answer.avgtotal)
            const sysuse = (
               answer.answer1
               + answer.answer2
               + answer.answer3
               + answer.answer4
               + answer.answer5
               + answer.answer6) / 6
            const info = (
               answer.answer7
               + answer.answer8
               + answer.answer9
               + answer.answer10
               + answer.answer11
               + answer.answer12) / 6
            const interfaz = (
               answer.answer13
               + answer.answer14
               + answer.answer15) / 3
            avg_sysuse.push(sysuse)
            avg_info.push(info)
            avg_interfaz.push(interfaz)
         }
      }

      const serie_avg_total = calcularEstadisticas(avg_total)
      const serie_avg_sysuse = calcularEstadisticas(avg_sysuse)
      const serie_avg_info = calcularEstadisticas(avg_info)
      const serie_avg_interfaz = calcularEstadisticas(avg_interfaz)

      const series = [
         {
            type: 'boxPlot',
            data: [
               {
                  x: 'General',
                  y: serie_avg_total
               },
               {
                  x: 'Interfaz Quality',
                  y: serie_avg_sysuse
               },
               {
                  x: 'Info Quality',
                  y: serie_avg_info
               },
               {
                  x: 'System Usability',
                  y: serie_avg_interfaz
               },
            ]
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