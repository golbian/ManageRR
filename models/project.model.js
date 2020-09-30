module.exports = mongoose => {

    // var resourceSchema = mongoose.Schema({
    //   _id: String,
    //   resource_id: String,
    //   value: Number,
    // });

    var activitySchema = mongoose.Schema({
        _id: String,
        name: String,
        kam: String,
        pm: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        },
        client: String,
        stage: String,
        temp: String,
        domaine: String,
        etp: Number,
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
        pm : {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        },
        stage: String,
        temp: String,
        domaine: String,
        etp: Number,
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