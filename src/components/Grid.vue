<template>
<div ref="container" id='container' class="widget-box">
</div>
</template>

<script>
import { Grid as GridDHX} from "dhx-grid";
import "dhx-grid/codebase/grid.min.css";
import GridServices from '../services/grid.service';
import ProjectServices from '../services/project.service';
import ScheduleServices from '../services/schedule.service';
import moment from 'moment';

export default {
    data() {
        return {
            grid:{
                id:null,
                name:null,
            },
            submitted: false,
            dataset: [],
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        }
    },
    created() {

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

            ProjectServices.getAllProject().then(response => {

                for(const data of response.data) {

                    data.id = data._id;
                    data.start_date = formatDate(data.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    data.end_date = formatDate(data.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    if(data.pm) {
                        data.pm = data.pm.username
                    }
                    this.dataset.push(data);
                
                    for(const schedule of data.schedules) {
                        schedule.projectId = data._id;
                        schedule.id = schedule._id;
                        schedule.start_date = formatDate(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        schedule.end_date = formatDate(schedule.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        this.dataset.push(schedule)
                    }
                }
                this.grid.data.parse(this.dataset);
                console.log(this.dataset)
            });



    },
    mounted: function () {

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var config = {
                columns: [
                    { width: 100, id: 'name',header: [{ text: "Designation" },{ content: "inputFilter" }] },
                    { width: 100, id: 'country',header: [{ text: "Country" },{ content: "inputFilter" }] },
                    { width: 100, id: 'client',header: [{ text: "Client" },{ content: "inputFilter" }] },
                    { width: 100, id: 'kam',header: [{ text: "KAM" },{ content: "inputFilter" }] },
                    { width: 100, id: 'pm',header: [{ text: "PM" },{ content: "inputFilter" }] },
                    { 
                        width: 160, id: 'stage', 
                        header: [{ text: "Stage" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Opportunity", "RFQ/RFI", "BID", "Final Negociation", "Lost", "Abandoned", "Commandes", "Livrée", "Facture", "Suspended"] 
                    },
                    { 
                        width: 160, id: 'temp', 
                        header: [{ text: "Température" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Froid", "Moyen", "Chaud"] 
                    },
                    { 
                        width: 160, id: 'domaine', 
                        header: [{ text: "Domaine" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Training", "Product & System", "In-Service", "Improvaero"] 
                    },
                    { width: 100, id: 'charge',header: [{ text: "Charge" },{ content: "inputFilter" }] },
                    { width: 100, id: 'ca',header: [{ text: "CA" },{ content: "inputFilter" }] },
                    { width: 100, id: 'start_date',header: [{ text: "Start Date" },{ content: "inputFilter" }], type: 'date'},
                    { width: 100, id: 'end_date',header: [{ text: "End Date" },{ content: "inputFilter" }], type: 'date'},
                    { 
                        width: 160, id: 'status', 
                        header: [{ text: "Status" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Renewal", "Extension", "New Contract"] 
                    },
                    { width: 100, id: 'comments',header: [{ text: "Comments" },{ content: "inputFilter" }] },
                    { width: 100, id: 'ressource',header: [{ text: "Ressource" },{ content: "inputFilter" }] },
                    { width: 100, id: 'duration',header: [{ text: "Jours" },{ content: "inputFilter" }]},
                    { hidden: true, id: 'progress',header: [{ text: "Progress" }]},
                    { hidden: true, id: 'parent',header: [{ text: "Parent" }]},
                ],
                // data: this.gridData,
                selection: "cell",
                editable: true,
                autoWidth: true,
                keyNavigation: true
            };

        this.grid = new GridDHX(this.$refs.container, config);

        this.grid.selection.setCell(this.grid.data.getItem(this.grid.data.getId(0)), this.grid.config.columns[0]);

        this.grid.events.on('Change', function(id, status, data){

            var project = {};
            project.schedule = {};
            
            var startDate = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
            var endDate = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');


            if(data.type === "project") {
                project._id = data.id;
                project.name = data.name;
                // project.type = data.type;
                project.client = data.client;
                project.temp = data.temp;
                project.kam = data.kam;
                project.pm = data.pm.username;
                project.etp = data.etp;
                project.country = data.country;
                project.stage = data.stage;
                project.comments = data.comments;
                project.resource = data.ressource;
                project.status = data.status;
                project.start_date = startDate;
                project.end_date = endDate;
                project.charge = data.charge;
                project.domaine = data.domaine;
                project.ca = data.ca;
                if(status === 'update') {
                    ProjectServices.updateProject(id,project)
                    } else if(status === "add") {
                        ProjectServices.createProject(project)
                    }
            
            } else if(data.type === "task") {
                project._id = data.parent;
                project.schedule = {};
                project.schedule._id = id;
                project.schedule.start_date = startDate;
                project.schedule.end_date = endDate;
                project.schedule.parent = data.parent;
                project.schedule.duration = data.jours;
                project.schedule.name = data.name;
                // project.schedule.type = data.type;
                project.schedule.client = data.client;
                project.schedule.progress = data.progress;
                project.schedule.temp = data.temp;
                project.schedule.kam = data.kam;
                project.schedule.pm = "None";
                project.schedule.etp = data.etp;
                project.schedule.country = data.country;
                project.schedule.stage = data.stage;
                project.schedule.comments = data.comments;
                // project.schedule.resources = data.resources;
                project.schedule.status = data.status;
                project.schedule.charge = data.charge;
                project.schedule.domaine = data.domaine;
                project.schedule.ca = data.ca;
                if(status === 'update') {
                    ScheduleServices.updateSchedule(project._id,project)
                } else if(status === "add") {
                    ScheduleServices.createSchedule(project)
                }
            }
        });
    },

    methods: { 
        addProject() {
            var date = moment(new Date()).format('DD/MM/YY') 
            
            this.grid.data.add({
            "type": "project",
            "name": "name",
            "client": "Client Name",
            "status": "In Progress",
            "contract": "Contract",
            "start_date": date,
            "end_date": date,
            "charge": 20,
            "budget": 50,
            "exoN": 50,
            "ressource": "Gérard",
            "jours": 10,
            "achat": 1000,
            "itempo":"Item PO",
            "facture": 400,
            "ssTrt": 500,
            "fraisA": 1500,
            "fraisR": 250,
            });
            this.grid.paint();
        },

        saveGrid() {
            var data = {};

            data.id = this.grid.data.id;
            
            data.state = this.grid.data.serialize();

            data.name = this.grid.name;

            console.log(data);

            GridServices.createGrid(data)
            .then(response => {
                this.grid.id = response.data.id;
                console.log(response.data);
                this.submitted = true;
            })
            .catch(e => {
                console.log(e);
            });
        },
        clearGrid() {
      this.submitted = false;
      this.grid.destructor() ;
    }
    },
  }
</script>