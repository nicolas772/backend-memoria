const { authJwt, verifyProfile } = require("../middleware");
const dashStudy_controller = require("../controllers/dashStudy.controller");
const dashDemogrStudy_controller = require("../controllers/dashDemogrStudy.controller")
const dashUsabilityStudy_controller = require("../controllers/dashUsabilityStudy.controller")
const dashSentimentStudy_controller = require("../controllers/dashSentimentStudy.controller")
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/dashboard/study/general/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashStudy_controller.cards
  );
  app.get(
    "/api/dashboard/study/general/bar-list",
    [authJwt.verifyToken, authJwt.isTester],
    dashStudy_controller.barList
  );
  app.get(
    "/api/dashboard/study/general/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashStudy_controller.barChart
  );
  app.get(
    "/api/dashboard/study/general/table-time",
    [authJwt.verifyToken, authJwt.isTester],
    dashStudy_controller.tableTime
  );
  app.get(
    "/api/dashboard/study/demogr/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrStudy_controller.cards
  );
  app.get(
    "/api/dashboard/study/demogr/pie-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrStudy_controller.pieChart
  );
  app.get(
    "/api/dashboard/study/demogr/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrStudy_controller.barChart
  );
  app.get(
    "/api/dashboard/study/demogr/stacked-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrStudy_controller.stackedChart
  );
  app.get(
    "/api/dashboard/study/usability/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityStudy_controller.cards
  );
  app.get(
    "/api/dashboard/study/usability/box-plot",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityStudy_controller.boxPlot
  );
  app.get(
    "/api/dashboard/study/usability/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityStudy_controller.barChart
  );
  app.get(
    "/api/dashboard/study/sentiment/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentStudy_controller.cards
  );
  app.get(
    "/api/dashboard/study/sentiment/pie-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentStudy_controller.pieChart
  );
  app.get(
    "/api/dashboard/study/sentiment/carousel",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentStudy_controller.carousel
  );
  app.get(
    "/api/dashboard/study/sentiment/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentStudy_controller.barChart
  );
  app.get(
    "/api/dashboard/study/sentiment/cloud-word",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentStudy_controller.cloudWord
  );
};