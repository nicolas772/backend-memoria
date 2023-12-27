const { SentimentManager } = require('node-nlp');
const { NormalizerEs } = require('@nlpjs/lang-es');
const keyword_extractor = require("keyword-extractor");
const db = require("../models");
const GeneralSentiment = db.generalsentiment;
const InterfazSentiment = db.interfazsentiment;
const IterationState = db.iterationstate;
const Iteration = db.iteration
const Keyword = db.keyword
const axios = require("axios").default;
const apiKey = process.env.API_KEY

async function analizarSentimiento(texto) {
  const sentiment = new SentimentManager();
  const result = await sentiment.process('es', texto);
  return result;
}

exports.create = async (req, res) => {
  try {
    const opinion = req.body.opinion; //opinion a análisis
    const sentiment_user = req.body.selectedSentiment; //sentimiento entregado por el usuario
    const normalizer = new NormalizerEs();
    const opinion_normalizada = normalizer.normalize(opinion);
    const analisis = await analizarSentimiento(opinion_normalizada);
    const keywords =
      keyword_extractor.extract(opinion, {
        language: "spanish",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false

      });

    let falsePositive = false
    if (sentiment_user === "positive" && analisis.vote === "Negative") {
      falsePositive = true
    }
    if (sentiment_user === "negative" && analisis.vote === "Positive") {
      falsePositive = true
    }

    const keywords_no_neutral = []

    for (const keyword of keywords) {
      const analisis_key = await analizarSentimiento(keyword);
      if (analisis_key.vote != "neutral") {
        keywords_no_neutral.push(keyword)
        await Keyword.create({
          userId: req.body.idUser,
          iterationId: req.body.idIteration,
          keyword: keyword,
        });
      }
    }

    await GeneralSentiment.create({
      userId: req.body.idUser,
      iterationId: req.body.idIteration,
      answer: opinion,
      comparative: analisis.comparative,
      numhits: analisis.numHits,
      numwords: analisis.numWords,
      score: analisis.score,
      vote: analisis.vote,
      usersentiment: sentiment_user,
      falsepositive: falsePositive,
    });

    //analisis con EDEN AI
    //const languageResponse = await languageDetection(opinion_normalizada)
    //const language = languageResponse.data.google.items[0].language
    const language = "es"
    const sentimentResponse = await sentimentAnalisisIA(language, opinion_normalizada)
    const sentimentIA = sentimentResponse.data.microsoft.items[0]
    const sentiment = sentimentIA.sentiment
    let sentiment_rate = sentimentIA.sentiment_rate

    if (sentiment === "Negative") {
      sentiment_rate = sentiment_rate * -1
    }

    let falsePositiveIA = false
    if (sentiment_user === "positive" && sentiment === "negative") {
      falsePositiveIA = true
    }
    if (sentiment_user === "negative" && sentiment === "positive") {
      falsePositiveIA = true
    }
    await InterfazSentiment.create({
      userId: req.body.idUser,
      iterationId: req.body.idIteration,
      answer: opinion,
      comparative: sentiment_rate,
      vote: sentiment,
      usersentiment: sentiment_user,
      falsepositive: falsePositiveIA,
    });

    const iterationState = await IterationState.findOne({
      where: { iterationId: req.body.idIteration, userId: req.body.idUser }
    });
    iterationState.inTask = false
    iterationState.inCSUQ = false
    iterationState.inQuestion = false
    await iterationState.save()

    //lo que sigue, es para disminuir en 1 la cantidad de usuarios activos completando la iteracion
    //y aumentar en 1 la cantidad de usuarios que completaron la iteracion
    const iteration = await Iteration.findByPk(req.body.idIteration)
    iteration.users_qty -= 1
    iteration.users_qty_complete += 1
    await iteration.save()

    const responseData = {
      analisis_sentimiento: analisis,
      keywords: keywords_no_neutral,
      falso_positivo: falsePositive,
    };
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).send('Error en el análisis de sentimiento'); // Enviar un mensaje de error en caso de excepción
  }
};



exports.prueba = async (req, res) => {
  try {
    const opinion = req.body.opinion;

    //Pre Procesamiento datos
    const normalizer = new NormalizerEs();
    const opinion_normalizada = normalizer.normalize(opinion);
    //const analisis_sentimiento = await analizarSentimiento(opinion_normalizada) //con node nlp


    //analisis de sentimiento con eden ia
    //const languageResponse = await languageDetection(opinion_normalizada)
    //const language = languageResponse.data.google.items[0].language
    const language = "es"
    const sentimentResponse = await sentimentAnalisisIA(language, opinion_normalizada)
    const sentimentIA = sentimentResponse.data.microsoft.items[0]
    const sentiment = sentimentIA.sentiment
    let sentiment_rate = sentimentIA.sentiment_rate
    if (sentiment === "Negative") {
      sentiment_rate = sentiment_rate * -1
    }
    const userID = 18
    const iterationID = 3
    const sentiment_user = "positive"

    let falsePositive = false
    if (sentiment_user === "positive" && sentiment === "Negative") {
      falsePositive = true
    }
    if (sentiment_user === "negative" && sentiment === "Positive") {
      falsePositive = true
    }

    await InterfazSentiment.create({
      userId: userID,
      iterationId: iterationID,
      answer: opinion,
      comparative: sentiment_rate,
      vote: sentiment,
      usersentiment: sentiment_user,
      falsepositive: falsePositive,
    });

    const responseData = {
      sentiment: sentiment,
      sentiment_rate: sentiment_rate,
      falsePositive: falsePositive
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).send(error); // Enviar un mensaje de error en caso de excepción
  }
};

const languageDetection = (opinion) => {
  const options = {
    method: "POST",
    url: "https://api.edenai.run/v2/translation/language_detection",
    headers: {
      authorization: "Bearer " + apiKey,
    },
    data: {
      providers: "google",
      text: opinion,
      fallback_providers: "",
    },
  };

  return axios.request(options)
}

const sentimentAnalisisIA = (language, opinion) => {
  const options = {
    method: "POST",
    url: "https://api.edenai.run/v2/text/sentiment_analysis",
    headers: {
      authorization: "Bearer " + apiKey,
    },
    data: {
      providers: "microsoft",
      text: opinion,
      language: language,
      fallback_providers: "",
    },
  };

  return axios.request(options)
}

//PRUEBAS

/*
(nlp, natural) (natural solo tokenizado y normalizado)
Me encanta este producto, es increíble. (ok, ok) (ok)
La calidad del servicio al cliente es excelente. (ok, ok) (ok)
No estoy seguro de si debería recomendar este producto. (ok, X) (ok)
El rendimiento de esta aplicación es realmente malo. (ok, ok) (ok)
No puedo vivir sin esta aplicación, es esencial para mi trabajo. (ok, X) (neutral)
Aunque algunas características son útiles, en general no estoy satisfecho. (ok, X) (ok)
Estoy completamente impresionado por la funcionalidad de esta herramienta. (ok, ok) (ok)
La interfaz de usuario es complicada y difícil de usar. (ok, X) (neutral)
A pesar de algunos problemas, el software cumple con su propósito. (X, X) (x, menos negativa que nlp lo cual es bueno)
No hay nada positivo que pueda decir sobre esta experiencia. (X, X) (neutral)
no me gustó el software, es pésimo y está mal diseñado (X, ok)

No puedo soportar la publicidad constante en esta aplicación, arruina la experiencia. (ok, neutral)
La atención al cliente dejó mucho que desear, tardaron demasiado en responder. (ok, X)

*/

/*

(no procesado, no stopword)
Me encanta este producto, es increíble. ()

 */