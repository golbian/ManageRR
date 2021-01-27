const db = require("../models");
const mongoose = require("mongoose");
const csv = require('csvtojson');
const Project = db.project;
const moment =  require("moment");
// const mongodb = require("mongodb").MongoClient;

exports.upload =  (req, res) => {
  if (req.file == undefined) {
    return res.status(400).send({ message: "Please upload a file!" });
  }

  csv({
    trim: true,
    // ignoreEmpty: true,
    delimiter: ","
  })
  .fromFile(req.file.path)
  .then((file)=>{
    var projects = [];
  // var schedules = [];
  var parentWbs;

  var pushToProject = function(parentWbs, schedule) {
    for(const project of projects) {
      if(project.wbs === parentWbs) {
        schedule.parent = project._id;
        project.schedules.push(schedule);
      }
    }
  }

  for( const item of file ) {
    var data = {
      wbs: item["REF"],
      name: item["Designation"],
      country: item["Country"],
      client: item["Client"],
      kam: item["KAM"],
      pm: item["PM"],
      stage: item["STAGE"],
      temp: item["T°"],
      domain: item["Domain"],
      offre: item["OFFRE"],
      cmde: item["CMDE"],
      facture: item["FACTURE"],
      idFacture: item["idFACTURE"],
      etp: item["ETP"],
      charge: item[" CHARGE "],
      ca: item["CA"],
      debours: item["DEBOURS"],
      start_date: item["Start Date"],
      end_date: item["End Date (initial)"],
      end_date_revised: item["End Date (revised)"],
      tpelig: item["TPELIG"],
      status: item["Status"],
      comments: item["Comments"],
      duration: item["Durée (mois)"],
    }

    console.log(item)

    data.start_date = moment(data.start_date, '').format('YYYY-MM-DD[T00:00:00.000Z]');
    data.end_date = moment(data.end_date, '').format('YYYY-MM-DD[T00:00:00.000Z]');
    data.end_date_revised = moment(data.end_date_revised, '').format('YYYY-MM-DD[T00:00:00.000Z]');

    for(var i in data) {
      if(data[i] == undefined) {
        data[i] = "";
      }
        var wbs = data.wbs + "";
        data._id = wbs;
        var parts = wbs.split(".");
        parts.pop();
        data.parent = parts.join(".");
    }

    if(data.wbs) {
      if(data.parent == '') {
        data._id = new mongoose.mongo.ObjectId();
        parentWbs = data.wbs
        data.type = 'project'
        data.schedules = []
        projects.push(data)
      } else {
        data.nestedLevel = 1;
        data.type = 'task';
        pushToProject(parentWbs, data)
      }
    }
  }

  for(const project of projects) {
    if(project.charge !== "TBD" || project.charge !== "") {
      project.charge = parseInt(project.charge)
    } else {
      project.charge = 0;
    }
    if(project.charge === null) {
      project.charge = 0;
    }
    for(const schedule of project.schedules) {
      if (schedule) {
        if(schedule.charge !== "TBD" || schedule.charge !== "") {
          schedule.charge = parseInt(schedule.charge)
        } else {
          schedule.charge = 0;
        }
        if(schedule.charge === null) {
          schedule.charge = 0;
        }
      }
    }
  }

  // Save Project in the database
  Project
    .insertMany(projects)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Project state."
      })
    })
  })
};