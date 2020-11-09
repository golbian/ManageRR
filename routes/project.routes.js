const projects = require("../controllers/project.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {

    var router = require("express").Router();
  
    // Create a new Project
    router.post("/",[authJwt.verifyToken, authJwt.isAdmin], projects.create);
  
    // Retrieve all Projects
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], projects.findAll);
  
    // Retrieve all published Projects
    router.get("/published",[authJwt.verifyToken], projects.findAllPublished);

    //Retrieve all Owner's projects
    router.get("/user/:user",[authJwt.verifyToken, authJwt.isModerator], projects.findAllOwnerProject);
  
    // Retrieve a single Project with id
    router.get("/:id",[authJwt.verifyToken, authJwt.isModerator], projects.findOne);
  
    // Update a Project with id
    router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.update);

    //Attach a Project Manager to a Project with id
    router.put("/user/:user",[authJwt.verifyToken, authJwt.isAdmin], projects.attachPM)
  
    // Delete a Project with id
    router.delete("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.delete);
  
    app.use('/api/projects', router);
  };