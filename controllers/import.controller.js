const db = require("../models");
const mongoose = require("mongoose");
var XLSX = require('xlsx');
const Project = db.project;
// const mongodb = require("mongodb").MongoClient;

exports.upload =  (req, res) => {
  if (req.file == undefined) {
    return res.status(400).send({ message: "Please upload a file!" });
  }
  
  // let url = "mongodb://localhost:27017/";


  var workbook = XLSX.readFile(req.file.path, {cellDates: true});
  var sheet_name_list = workbook.SheetNames;
  var first_worksheet = workbook.Sheets[sheet_name_list[0]];
  
  var file = XLSX.utils.sheet_to_json(first_worksheet, {header:1});

  let projects = [];

  for( const item of file ) {
    var data = {
      designation: item[1],
      country: item[2],
      client: item[3],
      date: item[4],
      kam: item[5],
      pm:item[6],
      stage: item[7],
      modif: item[8],
      temp: item[9],
      domaine: item[10],
      offre: item[11],
      cmde: item[12],
      facture: item[13],
      id_facture: item[14],
      etp: item[15],
      charge: item[16],
      ca: item[17],
      debours: item[18],
      start_date: item[19],
      end_date: item[20],
      end_date_revised: item[21],
      status: item[23],
      duration: item[25]
    }


    for(var i in data) {
      if(data[i] == undefined) {
        data[i] = "";
      }
    }
    
    projects.push(data);
    
  }

  var doc = projects.slice(3);
  mongodb.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) throw err;
  
        client
        .db("test")
        .collection("projects")
        .insertMany(doc, (err, res) => {
          if (err) throw err;
  
          console.log(`Inserted: ${res.insertedCount} rows`);
          client.close();
        });
    }
  );
};