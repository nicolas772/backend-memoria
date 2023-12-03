const db = require("../models");
const User = db.user;
const Iteration = db.iteration;
const Task = db.task;
const InfoTask = db.infotask
const IterationState = db.iterationstate
const GeneralSentiment = db.generalsentiment
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
         sum_score += sentiment.score
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

      const responseData = {
         sentimiento_general: generalSentiment,
         color: colorMapSentiment[sentiment]
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

      if (!allGeneralSentiment || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const positiveOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "positive").length;
      const negativeOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "negative").length;
      const neutralOpinions = allGeneralSentiment.filter(opinion => opinion.vote === "neutral").length;

      const series = [positiveOpinions, neutralOpinions, negativeOpinions]
      const colors = ['#28a745', '#ffc107', '#dc3545']
      const labels = ["Positivo", "Neutro", "Negativo"]

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

      if (!allGeneralSentiment || !iteration) {
         return res.status(404).json({ error: "Iteración No Encontrada." });
      }

      const scores = allGeneralSentiment.map(opinion => opinion.score.toFixed(2));

      const users = allGeneralSentiment.map(opinion => "Usuario ID " + opinion.userId)



      const responseData = {
         chartData: scores,
         categories: users,
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

