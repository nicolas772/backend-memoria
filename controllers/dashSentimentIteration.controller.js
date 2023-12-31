const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const IterationState = db.iterationstate
const GeneralSentiment = db.generalsentiment
const InterfazSentiment = db.interfazsentiment
const Keyword = db.keyword
const { Op } = require('sequelize'); // Necesitas importar Op desde sequelize

const rangos = ["Niños", "Adolescentes", "Jovenes", "Adultos", "Adulto Mayores"]
const colorMapSentiment = {
   Positivo: "green",
   Neutro: "yellow",
   Negativo: "red",
}
const emojiMapSentiment = {
   Positivo: "😁",
   Neutro: "😐",
   Negativo: "🙁",
}

exports.cards = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allGeneralSentiment = await GeneralSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      const allGeneralSentiment_with_falses = await GeneralSentiment.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allGeneralSentiment || !allGeneralSentiment_with_falses || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      //CARD 1: Sentimiento General Usuarios
      const allSentimentQty = allGeneralSentiment.length
      const allSentimentWithFalsesQty = allGeneralSentiment_with_falses.length
      let confident = 0
      if (allSentimentWithFalsesQty > 0) {
         confident = (allSentimentQty / allSentimentWithFalsesQty) * 100
      }
      let sum_score = 0
      let sum_words = 0
      let sum_hits = 0
      let avg_score = 0
      let avg_words = 0
      let avg_hits = 0
      for (const sentiment of allGeneralSentiment) {
         sum_score += sentiment.comparative
         sum_words += sentiment.numwords
         sum_hits += sentiment.numhits
      }
      if (allSentimentQty > 0) {
         avg_score = sum_score / allSentimentQty
         avg_words = sum_words / allSentimentQty
         avg_hits = sum_hits / allSentimentQty
      }

      let sentiment = avg_score > 0 ? "Positivo" : avg_score < 0 ? "Negativo" : "Neutro";

      const generalSentiment = {
         title: "Sentimiento General Usuarios",
         metric: `${sentiment} ${emojiMapSentiment[sentiment]}`,
         columnName1: "Métrica",
         columnName2: "Valor",
         data: [
            {
               name: "Score Promedio",
               stat: avg_score.toFixed(2),
               icon: "score",
            },
            {
               name: "Confianza",
               stat: confident.toFixed(0) + "%",
               icon: "activa",
            },
            {
               name: "Promedio Palabras por opinión",
               stat: avg_words.toFixed(2),
               icon: "palabras",
            },
            {
               name: "Promedio Hits por opinión",
               stat: avg_hits.toFixed(2),
               icon: "hits"
            },
         ]
      };

      //CARD CON IA

      const allGeneralSentimentIA = await InterfazSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      const allGeneralSentiment_with_falses_IA = await InterfazSentiment.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allGeneralSentimentIA || !allGeneralSentiment_with_falses_IA || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }
      //CARD 1: Sentimiento General Usuarios
      const allSentimentQtyIA = allGeneralSentimentIA.length
      const allSentimentWithFalsesQtyIA = allGeneralSentiment_with_falses_IA.length
      let confidentIA = 0
      if (allSentimentWithFalsesQtyIA > 0) {
         confidentIA = (allSentimentQtyIA / allSentimentWithFalsesQtyIA) * 100
      }
      let sum_score_IA = 0
      let avg_score_IA = 0
      for (const sentiment of allGeneralSentimentIA) {
         sum_score_IA += sentiment.comparative
      }
      if (allSentimentQtyIA > 0) {
         avg_score_IA = sum_score_IA / allSentimentQtyIA
      }

      let sentimentIA = avg_score_IA > 0 ? "Positivo" : avg_score_IA < 0 ? "Negativo" : "Neutro";

      const generalSentimentIA = {
         title: "Sentimiento General Usuarios",
         metric: `${sentimentIA} ${emojiMapSentiment[sentimentIA]}`,
         columnName1: "Métrica",
         columnName2: "Valor",
         data: [
            {
               name: "Score Promedio",
               stat: avg_score_IA.toFixed(2),
               icon: "score",
            },
            {
               name: "Confianza",
               stat: confidentIA.toFixed(0) + "%",
               icon: "activa",
            },
            {
               name: "Promedio Palabras por opinión",
               stat: avg_words.toFixed(2),
               icon: "palabras",
            },
            {
               name: "Promedio Hits por opinión",
               stat: avg_hits.toFixed(2),
               icon: "hits"
            },
         ]
      };

      const responseData = {
         sentimiento_general_lexicon: generalSentiment,
         color_lexicon: colorMapSentiment[sentiment],
         sentimiento_general_IA: generalSentimentIA,
         color_IA: colorMapSentiment[sentimentIA]
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

      const allGeneralSentiment = await GeneralSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      const allGeneralSentimentIA = await InterfazSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      if (!allGeneralSentiment || !allGeneralSentimentIA || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const positiveOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "positive").length;
      const negativeOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "negative").length;
      const neutralOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "neutral").length;

      const positiveOpinionsIA = allGeneralSentimentIA.filter(opinion => opinion.vote === "Positive").length;
      const negativeOpinionsIA = allGeneralSentimentIA.filter(opinion => opinion.vote === "Negative").length;
      const neutralOpinionsIA = allGeneralSentimentIA.filter(opinion => opinion.vote === "Neutral").length;

      const series = [positiveOpinions, neutralOpinions, negativeOpinions]
      const seriesIA = [positiveOpinionsIA, neutralOpinionsIA, negativeOpinionsIA]
      const colors = ['#28a745', '#ffc107', '#dc3545']
      const labels = ["Positivo", "Neutro", "Negativo"]

      const responseDataLexicon = {
         series: series,
         labels: labels,
         colors: colors
      }
      const responseDataIA = {
         series: seriesIA,
         labels: labels,
         colors: colors
      }
      const responseData = {
         lexicon: responseDataLexicon,
         IA: responseDataIA
      }
      res.status(200).json(responseData);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.carousel = async (req, res) => {
   const idIteration = req.query.idIteration;
   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration
         }
      })

      const allGeneralSentiment = await GeneralSentiment.findAll({
         where: {
            iterationId: idIteration,
         }
      })

      if (!allGeneralSentiment || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const opinions = allGeneralSentiment.map(opinion => opinion.answer);

      const responseData = {
         opiniones: opinions
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

      const allGeneralSentiment = await GeneralSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      const allGeneralSentimentIA = await InterfazSentiment.findAll({
         where: {
            iterationId: idIteration,
            falsepositive: false
         }
      })

      if (!allGeneralSentiment || !allGeneralSentimentIA || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      /*const scores = allGeneralSentiment.map(opinion => opinion.score.toFixed(2));
      const users = allGeneralSentiment.map(opinion => "Usuario ID " + opinion.userId)*/

      const allUserIds = allGeneralSentiment.map(opinion => opinion.userId)
      const basicIds = await getIdsByLevel(allUserIds, "Básico")
      const mediumIds = await getIdsByLevel(allUserIds, "Medio")
      const advancedIds = await getIdsByLevel(allUserIds, "Avanzado")

      const allUserIdsIA = allGeneralSentimentIA.map(opinion => opinion.userId)
      const basicIdsIA = await getIdsByLevel(allUserIdsIA, "Básico")
      const mediumIdsIA = await getIdsByLevel(allUserIdsIA, "Medio")
      const advancedIdsIA = await getIdsByLevel(allUserIdsIA, "Avanzado")

      const arrBasicScores = allGeneralSentiment
         .filter(opinion => basicIds.includes(opinion.userId))
         .map(opinion => opinion.comparative);

      const arrBasicScoresIA = allGeneralSentimentIA
         .filter(opinion => basicIdsIA.includes(opinion.userId))
         .map(opinion => opinion.comparative);

      const arrMediumScores = allGeneralSentiment
         .filter(opinion => mediumIds.includes(opinion.userId))
         .map(opinion => opinion.comparative);
      
      const arrMediumScoresIA = allGeneralSentimentIA
         .filter(opinion => mediumIdsIA.includes(opinion.userId))
         .map(opinion => opinion.comparative);

      const arrAdvancedScores = allGeneralSentiment
         .filter(opinion => advancedIds.includes(opinion.userId))
         .map(opinion => opinion.comparative);

      const arrAdvancedScoresIA = allGeneralSentimentIA
         .filter(opinion => advancedIdsIA.includes(opinion.userId))
         .map(opinion => opinion.comparative);


      const avgBasicScores = calcularPromedio(arrBasicScores)
      const avgMediumScores = calcularPromedio(arrMediumScores)
      const avgAdvancedScores = calcularPromedio(arrAdvancedScores)

      const avgBasicScoresIA = calcularPromedio(arrBasicScoresIA)
      const avgMediumScoresIA = calcularPromedio(arrMediumScoresIA)
      const avgAdvancedScoresIA = calcularPromedio(arrAdvancedScoresIA)


      const colors = ["green", "yellow"];

      const responseData = {
         chartDataLexicon: [
            avgBasicScores,
            avgMediumScores,
            avgAdvancedScores,
         ],
         chartDataIA: [
            avgBasicScoresIA,
            avgMediumScoresIA,
            avgAdvancedScoresIA,
         ],
         categories: ["Básico", "Medio", "Avanzado"],
         colors: colors
      };

      res.status(200).json(responseData);

   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ha ocurrido un error al obtener los datos" });
   }
};

exports.cloudWord = async (req, res) => {
   const idIteration = req.query.idIteration;

   try {
      const iteration = await Iteration.findOne({
         where: {
            id: idIteration,
         },
      });

      const allKeywords = await Keyword.findAll({
         where: {
            iterationId: idIteration,
         },
         attributes: ['keyword'], // Seleccionar solo la columna 'keyword'
      });

      if (!allKeywords || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      // Obtener un array de las palabras
      const keywordArray = allKeywords.map((keyword) => keyword.keyword);

      // Construir un objeto con la frecuencia de cada palabra
      const wordFrequency = keywordArray.reduce((acc, word) => {
         acc[word] = (acc[word] || 0) + 1;
         return acc;
      }, {});

      // Convertir el objeto a un array de objetos
      const data = Object.entries(wordFrequency).map(([value, count]) => ({
         value,
         count,
      }));

      // Filtrar las palabras que tienen al menos 2 ocurrencias
      const filteredData = data.filter(({ count }) => count >= 2);

      const responseData = {
         data: data,
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
      throw new Error('Error al obtener usuarios por nivel');
   }
}

function calcularPromedio(arr) {
   if (arr.length === 0) {
      return 0; // Manejar el caso de un array vacío para evitar dividir por cero
   }

   const suma = arr.reduce((total, elemento) => total + elemento, 0);
   const promedio = suma / arr.length;

   return promedio.toFixed(2);
}
