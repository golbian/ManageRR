const events = require("../controllers/event.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {
  
    var router = require("express").Router();

    //Create a new event
    router.post("/",[authJwt.verifyToken], events.create);

    //Get All events
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], events.findAllEvents);

    //Get All admin events
    router.get("/month/admin", [authJwt.verifyToken, authJwt.isAdmin], events.findAllEventsPerMonth);
    
    //Get All pm events
    router.get("/pm/:pm", [authJwt.verifyToken, authJwt.isPm], events.findAllPmEvents);

    //Get All kam events
    router.get("/kam/:kam", [authJwt.verifyToken, authJwt.isKam], events.findAllKamEvents);

    //Retrieve all Owner's events
    router.get("/user/:user",[authJwt.verifyToken], events.findAllOwnerEvents);

    //Get All pm events
    router.get("/month/pm/:pm", [authJwt.verifyToken, authJwt.isPm], events.findAllPmEventsPerMonth);

    //Get All kam events
    router.get("/month/kam/:kam", [authJwt.verifyToken, authJwt.isKam], events.findAllKamEventsPerMonth);

    //Retrieve all Owner's events
    router.get("/month/user/:user",[authJwt.verifyToken], events.findAllOwnerEventsPerMonth);

    //Update an event
    router.put("/:id",[authJwt.verifyToken], events.update);

    //Delete an event with id
    router.delete("/:id", [authJwt.verifyToken], events.delete)
  
    app.use('/api/events', router);
  };