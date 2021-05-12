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
        charge: Number,
        ca: mongoose.Schema.Types.Mixed,
        pm: String,
        comments: String,
        root: String,
        country: String,
        type: String,
        parent: String,
        parentWbs: String,
        nestedLevel: Number,
        status: String,
        progress: Number,
        level: String,
        start_date: mongoose.Schema.Types.Mixed,
        end_date: mongoose.Schema.Types.Mixed,
        end_date_revised: mongoose.Schema.Types.Mixed,
        resources: Array,
        duration: mongoose.Schema.Types.Mixed,
    });

    var linkSchema = mongoose.Schema({
        _id: String,
        source: String,
        target: String,
        type: Number,
    });    

    var projectSchema = mongoose.Schema({
        wbs: String,
        type: String,
        name: String,
        client: String,
        contact: String,
        country: String,
        stage: String,
        kam: String,
        pm : String,
        temp: String,
        domaine: String,
        cmde: String,
        cmde_link: String,
        bl: String,
        bl_chrono: String,
        facture: String,
        facture_link: String,
        facture_id: String,
        facture_date: mongoose.Schema.Types.Mixed,
        regt_initial: mongoose.Schema.Types.Mixed,
        regt_expect: mongoose.Schema.Types.Mixed,
        regt_final: mongoose.Schema.Types.Mixed,
        charge: Number,
        rate: mongoose.Schema.Types.Mixed,
        etp: mongoose.Schema.Types.Mixed,
        ca: mongoose.Schema.Types.Mixed,
        debours: String,
        comments: String,
        status: String,
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