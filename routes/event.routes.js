const events = require("../controllers/event.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {
  
    var router = require("express").Router();

    //Create a new event
    router.post("/",[authJwt.verifyToken, authJwt.isModerator], events.create);

    //Retrieve all Owner's events
    router.get("/user/:id",[authJwt.verifyToken, authJwt.isModerator], events.findAllOwnerEvents);

    //Update an event
    router.put("/:id",[authJwt.verifyToken,  authJwt.isModerator || authJwt.isAdmin ], events.update);

    //Delete an event with id
    router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], events.delete)

    //Get All events
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], events.findAll);
  
    app.use('/api/events', router);
  };