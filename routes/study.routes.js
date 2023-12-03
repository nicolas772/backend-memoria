const controller = require("../controllers/study.controller");
const { authJwt, verifyStudy } = require("../middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/study/create", 
  [verifyStudy.checkDuplicateStudyName], 
  controller.create);

  app.put("/api/study/update",
  controller.updateStudy);

  app.delete("/api/study/delete",
  controller.deleteStudy);
  
  app.get(
    "/api/test/studies",
    [authJwt.verifyToken, authJwt.isTester],
    controller.getStudies
  );

  app.get(
    "/api/test/study",
    [authJwt.verifyToken, authJwt.isTester],
    controller.getStudy
  );
};

