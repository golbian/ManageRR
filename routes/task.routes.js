// const tasks = require("../controllers/project.controller.js");
// const { authJwt } = require("../middlewares");
// module.exports = app => {

//     var router = require("express").Router();
  
//     // Create a new Project
//     router.post("/",[authJwt.verifyToken, authJwt.isAdmin], tasks.create);
  
//     // Retrieve all Projects
//     router.get("/", [authJwt.verifyToken, authJwt.isAdmin], tasks.findAll);
  
//     // Retrieve all published Projects
//     router.get("/published",[authJwt.verifyToken], tasks.findAllPublished);

//     //Retrieve all Owner's projects
//     router.get("/user/:user",[authJwt.verifyToken, authJwt.isModerator], tasks.findAllOwnerProject);
  
//     // Retrieve a single Project with id
//     router.get("/:id",[authJwt.verifyToken, authJwt.isModerator], tasks.findOne);
  
//     // Update a Project with id
//     router.put("/:id",[authJwt.verifyToken, authJwt.isAdmin], tasks.update);
  
//     // Delete a Project with id
//     router.delete("/:id",[authJwt.verifyToken, authJwt.isAdmin], tasks.delete);
  
//     app.use('/api/task', router);
//   };