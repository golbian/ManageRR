module.exports = mongoose => {
    var activitySchema = mongoose.Schema({
        _id: String,
        name: String,
        contract: String,
        parent: String,
        nestedLevel: Number,
        progress: Number,
        exoN: Number,
        facture: String,
        start_date: Date,
        end_date: Date,
        ressource: String,
        duration: Number,
        itempo: String,
        achat: Number,
        fraisR: Number,
        fraisA: Number
    });

    var projectSchema = mongoose.Schema({
        _id: String,
        projectName: String,
        client: String,
        status: String,
        type: String,
        start_date: Date,
        end_date: Date,
        parent: String,
        progress: Number,
        duration: Number,
        charge: Number,
        budget: Number,
        ssTrt: Number,
        link: Array,
        schedules: [activitySchema]
    });

    projectSchema.virtual('id').get(function(){
      return this._id;
  });

  // Ensure virtual fields are serialised.
  projectSchema.set('toJSON', {
      virtuals: true
  });

const Project = mongoose.model("project", projectSchema);
    return Project;
  };