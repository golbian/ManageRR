const projects = require("../controllers/project.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {

  
    var router = require("express").Router();
  
    // Create a new Project
    router.post("/",[authJwt.verifyToken, authJwt.isAdmin], projects.create);
  
    // Retrieve all Projects
    router.get("/", [authJwt.verifyToken], projects.findAll);
  
    // Retrieve all published Projects
    router.get("/published",[authJwt.verifyToken], projects.findAllPublished);
  
    // Retrieve a single Project with id
    router.get("/:id",[authJwt.verifyToken], projects.findOne);
  
    // Update a Project with id
    router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.update);
  
    // Delete a Project with id
    router.delete("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.delete);
  
    // Create a new Project
    router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], projects.deleteAll);
  
    app.use('/api/projects', router);
  };