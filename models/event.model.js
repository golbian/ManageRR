module.exports = mongoose => {

    var eventSchema = mongoose.Schema({
        _id: String,
        name:String,
        client: String,
        projects: [
            {
              _id: String,
              type: String,
              ref: "project"
            }
        ],
        deliverable: String,
        project_id: String,
        schedule_id: String,
        activityName: String,
        start_date:String,
        end_date: String,
        tps: Number,
        duration: Number,
        insitu: Boolean
        },
        { timestamps: true }
    );
    const Pointing = mongoose.model("pointing", eventSchema);
        return Pointing;
      };