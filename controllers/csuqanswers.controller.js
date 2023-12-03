const db = require("../models");
const CsuqAnswers = db.csuqanswers;
const IterationState = db.iterationstate;

// hacer los promedios aquí
function promediosCSUQ(respuestas_array) {
  const sumaTotal = respuestas_array.reduce((acc, num) => acc + num, 0);
  const promedioTotal = sumaTotal / respuestas_array.length;
  const porcionSysUse = respuestas_array.slice(0, 6);
  const sumaSysUse = porcionSysUse.reduce((acc, num) => acc + num, 0);
  const promedioSysUse = sumaSysUse / porcionSysUse.length;

  const porcionInfoQual = respuestas_array.slice(6, 12);
  const sumaInfoQual = porcionInfoQual.reduce((acc, num) => acc + num, 0);
  const promedioInfoQual = sumaInfoQual / porcionInfoQual.length;

  const porcionIntQual = respuestas_array.slice(12, 15);
  const sumaIntQual = porcionIntQual.reduce((acc, num) => acc + num, 0);
  const promedioIntQual = sumaIntQual / porcionIntQual.length;

  const sus_score = (promedioTotal - 1) * (100 / 6);

  return [promedioTotal, promedioSysUse, promedioInfoQual, promedioIntQual, sus_score];
}

exports.create = async (req, res) => {
  try {
    const [promedioTotal, promedioSysUse, promedioInfoQual, promedioIntQual, sus_score] = promediosCSUQ(
      req.body.respuestas
    );

    await CsuqAnswers.create({
      userId: req.body.idUser,
      iterationId: req.body.idIteration,
      answer1: req.body.respuestas[0],
      answer2: req.body.respuestas[1],
      answer3: req.body.respuestas[2],
      answer4: req.body.respuestas[3],
      answer5: req.body.respuestas[4],
      answer6: req.body.respuestas[5],
      answer7: req.body.respuestas[6],
      answer8: req.body.respuestas[7],
      answer9: req.body.respuestas[8],
      answer10: req.body.respuestas[9],
      answer11: req.body.respuestas[10],
      answer12: req.body.respuestas[11],
      answer13: req.body.respuestas[12],
      answer14: req.body.respuestas[13],
      answer15: req.body.respuestas[14],
      answer16: req.body.respuestas[15],
      avgtotal: promedioTotal,
      avgsysuse: promedioSysUse,
      avginfoqual: promedioInfoQual,
      avgintqual: promedioIntQual,
      scoresus: sus_score
    });

    const iterationState = await IterationState.findOne({
      where: { iterationId: req.body.idIteration, userId: req.body.idUser }
    });
    iterationState.inTask = false
    iterationState.inCSUQ = false
    iterationState.inQuestion = true
    await iterationState.save()

    res.send({ message: "Las respuestas CSUQ han sido enviadas con éxito!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
