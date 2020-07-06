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
            

            ProjectServices.getAllProject().then(response => {

                for(const data of response.data) {

                    data.start_date = moment(data.start_date).format('DD/MM/YY')
                    data.end_date = moment(data.end_date).format('DD/MM/YY')
                    this.dataset.push(data);
                
                    for(const activity of data.schedules) {
                        activity.type = "Activity";
                        activity.activityName = activity.name;
                        activity.jours = activity.duration;
                        activity.start_date = moment(activity.start_date).format('DD/MM/YY')
                        activity.end_date = moment(activity.end_date).format('DD/MM/YY')
                        this.dataset.push(activity)
                    }
                }
                this.grid.data.parse(this.dataset);
            });



    },
    mounted: function () {
        var config = {
                columns: [
                    { width: 100, id: 'activityName',header: [{ text: "Activity Name" },{ content: "inputFilter" }] },
                    { width: 100, id: 'type',header: [{ text: "Type" },{ content: "inputFilter" }] },
                    { width: 100, id: 'projectName',header: [{ text: "Project Name" },{ content: "inputFilter" }] },
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
                    { width: 100, id: 'jours',header: [{ text: "Jours" },{ content: "inputFilter" }]},
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
            var activity = {};
            var startDate = moment(data.start_date,'DD/MM/YY').format();
            var endDate = moment(data.end_date, 'DD/MM/YY').format();

            project._id = data.id;
            project.projectName = data.projectName;
            project.type = data.type;
            project.client = data.client;
            project.status = data.status;
            project.start_date = startDate;
            project.end_date = endDate;
            project.charge = data.charge;
            project.budget = data.budget;
            project.ssTrt = data.ssTrt;
            project.schedules = [];

            activity.activityName = data.activityName;
            activity.contract = data.contract;
            activity.exoN = data.exoN;
            activity.facture = data.facture;
            activity.ressource = data.ressource;
            activity.jours = data.jours;
            activity.itempo = data.itempo;
            activity.achat = data.achat;
            activity.fraisR = data.fraisR;
            activity.fraisA = data.fraisA;

            project.schedules.push(activity);

            if(status === 'update') {
                ProjectServices.updateProject(id,project)
            } else if(status === "add") {
                ProjectServices.createProject(project)
            }
        });
    },

    methods: { 
        addProject() {
            var date = moment(new Date()).format('DD/MM/YY') 
            
            this.grid.data.add({
            "activityName": "ActivityName",
            "type": "Project",
            "projectName": "ProjectName",
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