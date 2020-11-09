const projects = require("../controllers/roles.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {

    var router = require("express").Router();
  
    // Create a new Role
    router.post("/",[authJwt.verifyToken, authJwt.isAdmin], projects.create);
  
    // Retrieve all Roles
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], projects.findAll);
  
    // Retrieve a single Role with id
    router.get("/:id",[authJwt.verifyToken, authJwt.isModerator], projects.findOne);
  
    // Update a Role with id
    router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.update);
  
    // Delete a Role with id
    router.delete("/:id",[authJwt.verifyToken, authJwt.isAdmin], projects.delete);
  
    app.use('/api/roles', router);
  };