<template>
<div ref="container" id='container' class="widget-box">
<button v-on:click="saveGrid()" class="btn btn-success">Save</button>
<button v-on:click="addProject()" class="btn btn-success">Project +</button>
<button v-on:click="clearGrid()" class="btn btn-success">Clear</button>
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
                    this.dataset.push(data);
                
                    for(const activity of data.schedules) {
                        activity.projectId = data._id;
                        activity.id = activity._id;
                        activity.start_date = formatDate(activity.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        activity.end_date = formatDate(activity.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        this.dataset.push(activity)
                    }
                }
                this.grid.data.parse(this.dataset);
            });



    },
    mounted: function () {

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var config = {
                columns: [
                    { width: 100, id: 'type',header: [{ text: "Type" },{ content: "inputFilter" }] },
                    { width: 100, id: 'name',header: [{ text: "name" },{ content: "inputFilter" }] },
                    { width: 100, id: 'client',header: [{ text: "Client" },{ content: "inputFilter" }] },
                    { 
                        width: 160, id: 'status', 
                        header: [{ text: "Status" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Done", "In Progress", "Not Started"] 
                    },
                    { width: 100, id: 'contract',header: [{ text: "Contrat" },{ content: "inputFilter" }] },
                    { width: 100, id: 'start_date',header: [{ text: "Debut" },{ content: "inputFilter" }], type: 'date'},
                    { width: 100, id: 'end_date',header: [{ text: "\u00c9cheance" },{ content: "inputFilter" }], type: 'date'},
                    { width: 100, id: 'charge',header: [{ text: "Charge" },{ content: "inputFilter" }] },
                    { width: 100, id: 'budget',header: [{ text: "Budget" },{ content: "inputFilter" }] },
                    { width: 100, id: 'exoN',header: [{ text: "EXO N" },{ content: "inputFilter" }] },
                    { width: 100, id: 'ressource',header: [{ text: "Ressource" },{ content: "inputFilter" }] },
                    { width: 100, id: 'duration',header: [{ text: "Jours" },{ content: "inputFilter" }]},
                    { width: 100, id: 'achat',header: [{ text: "Achat" },{ content: "inputFilter" }] },
                    { width: 100, id: 'itempo',header: [{ text: "Item PO" },{ content: "inputFilter" }] },
                    { width: 100, id: 'facture',header: [{ text: "Facture" },{ content: "inputFilter" }] },
                    { width: 100, id: 'ssTrt',header: [{ text: "Fact SS-TRT" },{ content: "inputFilter" }] },
                    { width: 120, id: 'fraisA',header: [{ text: "Frais Autorisés" },{ content: "inputFilter" }] },
                    { width: 100, id: 'fraisR',header: [{ text: "Frais Réel" },{ content: "inputFilter" }] },
                ],
            data: this.dataset,
            selection: "cell",
            editable: true,
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
                console.log(data);
                project._id = data.id;
                project.name = data.name;
                project.type = data.type;
                project.client = data.client;
                project.status = data.status;
                project.start_date = startDate;
                project.end_date = endDate;
                project.charge = data.charge;
                project.budget = data.budget;
                project.ssTrt = data.ssTrt;
                if(status === 'update') {
                    ProjectServices.updateProject(id,project)
                    } else if(status === "add") {
                        ProjectServices.createProject(project)
                    }
            
            } else if(data.type === "task") {
                console.log(data);
                project._id = data.parent;
                project.schedule._id = data.id;
                project.schedule.type = data.type;
                project.schedule.status = data.status;
                project.schedule.parent = data.parent;
                project.schedule.name = data.name
                project.schedule.start_date = startDate;
                project.schedule.end_date = endDate;
                project.schedule.contract = data.contract;
                project.schedule.exoN = data.exoN;
                project.schedule.facture = data.facture;
                project.schedule.ressource = data.ressource;
                project.schedule.duration = data.duration;
                project.schedule.itempo = data.itempo;
                project.schedule.achat = data.achat;
                project.schedule.fraisR = data.fraisR;
                project.schedule.fraisA = data.fraisA;
                if(status === 'update') {
                    ScheduleServices.updateSchedule(id,project)
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