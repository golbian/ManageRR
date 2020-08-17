const links = require("../controllers/link.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {

  
    var router = require("express").Router();

    //Create a new Schedule
    router.post("/",[authJwt.verifyToken, authJwt.isAdmin], links.create);

    //Update link in a Project

    router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin], links.update);

    //Delete a Schedule with id
    router.delete("/:projectId/LinkId",[authJwt.verifyToken, authJwt.isAdmin], links.delete);
  
    app.use('/api/link', router);
  };