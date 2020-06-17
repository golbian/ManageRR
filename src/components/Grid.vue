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
                // activityName: null,
                // type: 'Project',
                // projectName: null,
                // client: null,
                // status: null,
                // contract: null,
                // start: null,
                // end: null,
                // charge: null,
                // budget: null,
                // exoN: null,
                // ressource: null,
                // jours: null,
                // achat: null,
                // itempo: null,
                // facture: null,
                // ssTrt: null,
                // fraisA: null,
                // fraisR: null,
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        }
    },
    created() {
            

            ProjectServices.getAllProject().then(response => {

                this.dataset = response.data;

                for(const data of this.dataset) {

                    data.start_date = moment(data.start_date).format('DD/MM/YY')
                    data.end_date = moment(data.end_date).format('DD/MM/YY')
                
                    for(const activity of data.schedules) {
                        data.activityName = activity.name;
                        data.contract = activity.contract;
                        data.exoN = activity.exoN;
                        data.facture = activity.facture;
                        data.ressource = activity.ressource;
                        data.jours = activity.jours;
                        data.itempo = activity.itempo;
                        data.achat = activity.achat;
                        data.fraisR = activity.fraisR;
                        data.fraisA = activity.fraisA;
                    }
                }
                this.grid.data.parse(this.dataset);
            });



    },
    mounted: function () {
        // var dataset = [
        //     {
        //     "activity": "Schedule",
        //     "activityName": "Elec activity",
        //     "project": "Projet",
        //     "projectName": "Airbus A320",
        //     "client": "Airbus",
        //     "status": "In Progress",
        //     "contract": "Contrat",
        //     "start": "15/06/20",
        //     "end": "25/06/20",
        //     "charge": 20,
        //     "budget": 50,
        //     "exoN": 50,
        //     "ressource": "Gérard",
        //     "jours": 10,
        //     "achat": 1000,
        //     "itempo":"Item PO",
        //     "facture": 400,
        //     "ssTrt": 500,
        //     "fraisA": 1500,
        //     "fraisR": 250,
        //     },
        //     {
        //     "activity": "Schedule",
        //     "activityName": "Elec activity",
        //     "project": "Projet",
        //     "projectName": "Airbus A320",
        //     "client": "Airbus",
        //     "status": "In Progress",
        //     "contract": "Contrat",
        //     "start": "15/06/20",
        //     "end": "25/06/20",
        //     "charge": 20,
        //     "budget": 50,
        //     "exoN": 50,
        //     "ressource": "Gérard",
        //     "jours": 10,
        //     "achat": 1000,
        //     "itempo":"Item PO",
        //     "facture": 400,
        //     "ssTrt": 500,
        //     "fraisA": 1500,
        //     "fraisR": 250,
        //     }
        // ];

        var config = {
                columns: [
                    { width: 100, id: 'activityName',header: [{ text: "Activity Name" }] },
                    { width: 100, id: 'type',header: [{ text: "Type" }] },
                    { width: 100, id: 'projectName',header: [{ text: "Project Name" }] },
                    { width: 100, id: 'client',header: [{ text: "Client" }] },
                    { 
                        width: 160, id: 'status', 
                        header: [{ text: "Status" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Done", "In Progress", "Not Started"] 
                    },
                    { width: 100, id: 'contract',header: [{ text: "Contrat" }] },
                    { width: 100, id: 'start_date',header: [{ text: "Debut" }], type: 'date'},
                    { width: 100, id: 'end_date',header: [{ text: "\u00c9cheance" }], type: 'date'},
                    { width: 100, id: 'charge',header: [{ text: "Charge" }] },
                    { width: 100, id: 'budget',header: [{ text: "Budget" }] },
                    { width: 100, id: 'exoN',header: [{ text: "EXO N" }] },
                    { width: 100, id: 'ressource',header: [{ text: "Ressource" }] },
                    { width: 100, id: 'jours',header: [{ text: "Jours" }]},
                    { width: 100, id: 'achat',header: [{ text: "Achat" }] },
                    { width: 100, id: 'itempo',header: [{ text: "Item PO" }] },
                    { width: 100, id: 'facture',header: [{ text: "Facture" }] },
                    { width: 100, id: 'ssTrt',header: [{ text: "Fact SS-TRT" }] },
                    { width: 120, id: 'fraisA',header: [{ text: "Frais Autorisés" }] },
                    { width: 100, id: 'fraisR',header: [{ text: "Frais Réel" }] },
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

        // getSchedules() {
        //     connection.get('/api/schedules/find-all')
        // }
        
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