const db = require("../models");
const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
const Event = db.event;

// Create and Save a new Event
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const event = new Event({
    name: req.body.name,
    client: req.body.client,
    deliverable: req.body.deliverable,
    user: req.body.user,
    task: req.body.task,
    pm: req.body.pm,
    kam: req.body.kam,
    project: req.body.project,
    project_id: req.body.project_id,
    schedule_id: req.body.schedule_id,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    tps: req.body.tps,
    month: req.body.month,
    year: req.body.year,
    duration: req.body.duration,
    insitu: req.body.insitu
  });

  // Save Event in the database
  event
    .save(event)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Event state."
      });
    });
};

// Retrieve all Events from the database.
exports.findAllEvents = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    Event.find(condition).then(data => {
        if(data) {
            res.send(data);
        }

        else {
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving events."
            });
          }
    })
};

exports.findAllEventsPerMonth = (req, res) => {
  var aggregation = [
    {
      $group: {
        _id: {
          user: "$user",
          task: "$task",
          month: "$month",
          year: "$year"
        },
        name: { $first: "name"},
        user: { $first: "$user"},
        client: { $first: "$client"},
        deliverable: { $first: "$deliverable"},
        task: { $first: "$task"},
        pm: { $first: "$pm"},
        kam: { $first: "$kam"},
        project: { $first: "$project"},
        project_id: { $first: "$project_id"},
        schedule_id: { $first: "$schedule_id"},
        start_date: { $first: "$start_date"},
        end_date: { $first: "$end_date"},
        tps: { $first: "$tps"},
        duration: { $first: "$duration"},
        insitu: { $first: "$insitu"},
        month: { $first: "$month"},
        year: { $first: "$year"},
        pointage: { $sum: "$tps"},
        }
      }
  ]
  Event.find().then(()=>{
    return Event.aggregate(aggregation).exec(function(err, data) {
if(err) {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving projects."
          });
        } else {
          res.send(data);
        }
      })
    })
};

// Find a single Event with an id
// exports.findOne = (req, res) => {
//     const id = req.params.id;
  
//     Event.findById(id)
//       .populate({
//         path: 'schedules.resources',
//         populate: { path: 'resources' }
//       })
//       .then(data => {
//         if (!data)
//           res.status(404).send({ message: "Not found Event with id " + id });
//         else {
//           res.send(data);
//         }
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .send({ message: "Error retrieving Event with id=" + id });
//       });
//   };

// Update a Event by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.params.id;
  
    Event.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Event with id=${id}. Maybe Event was not found!`
          });
        } else res.send({ message: "Event was updated successfully." });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Event with id=" + id
        });
      });
  };

// Delete a Event with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    Event.findOneAndDelete({_id : id}, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Event with id=${id}. Maybe Event was not found!`
          });
        } else {
          res.send({
            message: "Event with id="+ id +" was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Event with id=" + id
        });
      });
  };

// Delete all Projects from the database.
exports.deleteAll = (req, res) => {
    Event.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} Projects were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all projects."
        });
      });
  };

  exports.findAllPmEvents = (req, res) => {
    const pm = req.params.pm;
    var aggregation = [
      {$match : {pm: pm}},
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };

  exports.findAllPmEventsPerMonth = (req, res) => {
    const pm = req.params.pm;
    var aggregation = [
      {$match : {pm: pm}},
      {
        $group: {
          _id: {
            user: "$user",
            task: "$task",
            month: "$month",
            year: "$year"
          },
          name: { $first: "name"},
          user: { $first: "$user"},
          client: { $first: "$client"},
          deliverable: { $first: "$deliverable"},
          task: { $first: "$task"},
          pm: { $first: "$pm"},
          kam: { $first: "$kam"},
          project: { $first: "$project"},
          project_id: { $first: "$project_id"},
          schedule_id: { $first: "$schedule_id"},
          start_date: { $first: "$start_date"},
          end_date: { $first: "$end_date"},
          tps: { $first: "$tps"},
          duration: { $first: "$duration"},
          insitu: { $first: "$insitu"},
          month: { $first: "$month"},
          year: { $first: "$year"},
          pointage: { $sum: "$tps"},
          }
        }
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };

  exports.findAllKamEvents = (req, res) => {
    const kam = req.params.kam;
    var aggregation = [
      {
        $match : {kam: kam},
      }
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };

  exports.findAllKamEventsPerMonth = (req, res) => {
    const kam = req.params.kam;
    var aggregation = [
      {
        $match : {kam: kam},
        $group: {
          _id: {
            user: "$user",
            task: "$task",
            month: "$month",
            year: "$year"
          },
          name: { $first: "name"},
          user: { $first: "$user"},
          client: { $first: "$client"},
          deliverable: { $first: "$deliverable"},
          task: { $first: "$task"},
          pm: { $first: "$pm"},
          kam: { $first: "$kam"},
          project: { $first: "$project"},
          project_id: { $first: "$project_id"},
          schedule_id: { $first: "$schedule_id"},
          start_date: { $first: "$start_date"},
          end_date: { $first: "$end_date"},
          tps: { $first: "$tps"},
          duration: { $first: "$duration"},
          insitu: { $first: "$insitu"},
          month: { $first: "$month"},
          year: { $first: "$year"},
          pointage: { $sum: "$tps"},
          },
        }
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };

  exports.findAllOwnerEvents = (req, res) => {
    const user = req.params.user;
    var aggregation = [
      {$match : {user: user}},
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };

  exports.findAllOwnerEventsPerMonth = (req, res) => {
    const user = req.params.user;
    var aggregation = [
      {$match : {user: user}},
      {
        $group: {
          _id: {
            user: "$user",
            task: "$task",
            month: "$month",
            year: "$year"
          },
          name: { $first: "name"},
          user: { $first: "$user"},
          client: { $first: "$client"},
          deliverable: { $first: "$deliverable"},
          task: { $first: "$task"},
          pm: { $first: "$pm"},
          kam: { $first: "$kam"},
          project: { $first: "$project"},
          project_id: { $first: "$project_id"},
          schedule_id: { $first: "$schedule_id"},
          start_date: { $first: "$start_date"},
          end_date: { $first: "$end_date"},
          tps: { $first: "$tps"},
          duration: { $first: "$duration"},
          insitu: { $first: "$insitu"},
          month: { $first: "$month"},
          year: { $first: "$year"},
          pointage: { $sum: "$tps"},
          }
        }
    ]
    Event.find()
    .then(() => {
      return Event.aggregate(aggregation)
      .exec(function(err, doc) {
        Event.populate(doc, {
            path: 'projects',
            populate: { path: 'project_id' },
          },function(err,data) {
            if(err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving events."
              });
            } else {
              res.send(data);
            }
        })
      })
    })
  };