const events = require("../controllers/event.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {
  
    var router = require("express").Router();

    //Create a new Schedule
    router.post("/",[authJwt.verifyToken, authJwt.isAdmin], events.create);

    //Update schedule in a Project

    router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin || authJwt.isModerator], events.update);

    //Delete a Schedule with id
    router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], events.delete)

    //Get All events
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], events.findAll);

    //Get owner events
    router.get(`:/id`, [authJwt.verifyToken], events.findAllOwnerEvent)
  
    app.use('/api/events', router);
  };