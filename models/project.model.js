module.exports = mongoose => {

    // var resourceSchema = mongoose.Schema({
    //   _id: String,
    //   resource_id: String,
    //   value: Number,
    // });

    var activitySchema = mongoose.Schema({
        name: String,
        kam: String,
        client: String,
        stage: String,
        temp: String,
        domaine: String,
        etp: mongoose.Schema.Types.Mixed,
        charge: mongoose.Schema.Types.Mixed,
        ca: mongoose.Schema.Types.Mixed,
        pm: String,
        comments: String,
        country: String,
        type: String,
        parent: String,
        parentWbs: String,
        nestedLevel: Number,
        status: String,
        progress: Number,
        start_date: mongoose.Schema.Types.Mixed,
        end_date: mongoose.Schema.Types.Mixed,
        end_date_revised: mongoose.Schema.Types.Mixed,
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
        wbs: String,
        name: String,
        country: String,
        kam: String,
        pm : String,
        stage: String,
        temp: String,
        domaine: String,
        charge: mongoose.Schema.Types.Mixed,
        etp: mongoose.Schema.Types.Mixed,
        ca: mongoose.Schema.Types.Mixed,
        comments: String,
        client: String,
        status: String,
        type: String,
        start_date: mongoose.Schema.Types.Mixed,
        end_date: mongoose.Schema.Types.Mixed,
        end_date_revised: mongoose.Schema.Types.Mixed,
        parent: String,
        progress: Number,
        duration: mongoose.Schema.Types.Mixed,
        published: Boolean,
        links: [linkSchema],
        schedules: [activitySchema]
    });

    // Ensure virtual fields are serialised.
    projectSchema.set('toJSON', {
      virtuals: true
    });

    // activitySchema.virtual('resource_id').get(function(){
    //   return this.resource._id;
    // });

const Project = mongoose.model("project", projectSchema);
    return Project;
  };