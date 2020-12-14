module.exports = mongoose => {

    var eventSchema = mongoose.Schema({
        name:String,
        client: String,
        owner: mongoose.Schema.Types.ObjectId,
        // projects: [
        //     {
        //       _id: String,
        //       type: String,
        //       ref: "project"
        //     }
        // ],
        deliverable: String,
        project_id: mongoose.Schema.Types.ObjectId,
        schedule_id: mongoose.Schema.Types.ObjectId,
        start_date:String,
        end_date: String,
        tps: Number,
        duration: Number,
        insitu: Boolean
        },
        { timestamps: true }
    );
    const Event = mongoose.model("event", eventSchema);
        return Event;
      };