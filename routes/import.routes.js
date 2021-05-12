const fileImport = require("../controllers/import.controller.js");
const { authJwt } = require("../middlewares");
const multer =  require('multer');
const upload = multer( { dest : '/api/upload' } );

module.exports = app => {

    var router = require("express").Router();

    router.post("/upload" , fileImport.upload );
    
    app.use('/api', upload.single('file'), router);
  };