const db = require("../models");
const mongoose = require("mongoose");
const Project = db.project;
const User = db.user;

exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.body.root;

  Project.findOneAndUpdate({_id: id}, {$push: { schedules: req.body}}, { useFindAndModify: true })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot create Schedule. Maybe Project was not found!`
        });
      } else {

        try {
          res.status(200).send({
            tid: data.schedules.slice(-1)[0]._id,
            action:"inserted",
          });
        } catch {
          res.status(500).send({
            message: "Error creating Schedule"
          });
        }
      }
    })
};

exports.findOne = (req, res) => {
  const id = req.params.projectId;
  const scheduleId = req.params.scheduleId;
  if(!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  Project.findOne({_id: id, "schedules._id": scheduleId},{ 'schedules.$._id': scheduleId })
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found Schedule with id " + id });
    else {
      res.send(data);
    }
  })
  .catch(err => {
    res
      .status(500)
      .send({ message: "Error retrieving Schedule with id=" + id });
  });
}

  exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.body.root;
    const scheduleId = req.body.id;

    Project.findOneAndUpdate(
       {_id: id, "schedules._id": scheduleId},
       {
        "schedules.$.start_date": req.body.start_date,
        "schedules.$.duration": req.body.duration,
        "schedules.$.parent": req.body.parent,
        "schedules.$.client": req.body.client,
        "schedules.$.status": req.body.status,
        "schedules.$.type": req.body.type, 
        "schedules.$.progress": req.body.progress,
        "schedules.$.end_date": req.body.end_date,
        "schedules.$.name": req.body.name,
        "schedules.$.contract": req.body.contract,
        "schedules.$.resources": req.body.resources,
        "schedules.$.country": req.body.country,
        "schedules.$.kam": req.body.kam,
        "schedules.$.charge": req.body.charge,
        "schedules.$.pm": req.body.pm,
        "schedules.$.stage": req.body.stage,
        "schedules.$.etp": req.body.etp,
        "schedules.$.domaine": req.body.domaine,
        "schedules.$.ca": req.body.ca,
        "schedules.$.comments": req.body.comments,
        "schedules.$.temp": req.body.temp,
      },{ useFindAndModify: false }
    )
      .then(data => {
        if(req.body.isAdmin) {
          // for(const resource of req.body.resources) {
          //   User.findOneAndUpdate({_id: resource._id},{$set: { value: resource.value }, $addToSet: { projects: id }},{ useFindAndModify: false }).then(data => {
          //     if(!data) {
          //         console.log(`Cannot update User value with id=${resource._id} in schedule(${scheduleId}) for Project with id=${id}`)
          //     } else console.log("User value was updated successfully.");
          //   })
          //   .catch(err => {
          //     console.log(
          //       "Error updating User value with id=" + resource._id
          //     );
          //   });
          // }
        }
        if (!data) {
          res.status(404).send({
            message: `Cannot update Schedule with id=${scheduleId} in Project with id=${id}. Maybe Schedule was not found!`
          });
        } else res.send({ 
          "action":"updated",
          message: "Schedule was updated successfully." 
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Schedule with id=" + scheduleId
        });
      });
  };

  // Delete a Schedule with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.projectId;
  const scheduleId = req.params.scheduleId;

  Project.findOneAndUpdate({_id: id }, { $pull: {schedules:{_id : scheduleId}}},{ useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Schedule with id=${scheduleId}. Maybe Schedule was not found!`
        });
      } else {
        res.send({
          "action":"deleted",
          message: "Schedule with id= " + scheduleId + "was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Schedule with id=" + scheduleId
      });
    });
};