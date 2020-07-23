module.exports = mongoose => {
    var activitySchema = mongoose.Schema({
        _id: String,
        name: String,
        kam: String,
        pm: String,
        client: String,
        stage: String,
        temp: String,
        domaine: String,
        etp: Number,
        charge: Number,
        ca: Number,
        comments: String,
        country: String,
        type: String,
        parent: String,
        nestedLevel: Number,
        status: String,
        progress: Number,
        start_date: Date,
        end_date: Date,
        resources: [
            resource_id = {
              type: mongoose.Schema.Types.ObjectId,
              ref: "user"
            },
          ],
        duration: Number,
    });

    var linkSchema = mongoose.Schema({
        _id: String,
        source: String,
        target: String,
        type: Number,
    });    

    var projectSchema = mongoose.Schema({
        _id: String,
        name: String,
        country: String,
        kam: String,
        pm: String,
        stage: String,
        temp: String,
        domaine: String,
        etp: Number,
        charge: Number,
        ca: Number,
        comments: String,
        client: String,
        status: String,
        type: String,
        start_date: Date,
        end_date: Date,
        parent: String,
        progress: Number,
        duration: Number,
        links: [linkSchema],
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