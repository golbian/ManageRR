<template>
<div ref="container" id='container' class="widget-box w-100 h-100">
</div>
</template>

<script>
// import { Grid as GridDHX} from "dhx-grid";
import {TreeGrid as TreeGridDHX } from 'dhx-suite';

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
            filters: {
                sort: {
                    value: 1,
                    type: "name",
                },
                search: "",
            }
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        },
        topRole() {
            var getHighestPrivilege = this.$store.state.auth.user.roles.length
            return this.$store.state.auth.user.roles[getHighestPrivilege - 1]
        }
    },
    created() {

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var getProjectService = (role, filters) => {
            if(role.name === "user") {
                return ProjectServices.getAllResourceProject(this.currentUser._id, filters)
            } else if(role.name === "pm") {
                return ProjectServices.getAllPmProject( this.currentUser.sigle, filters)
            } else if (role.name === "kam") {
                return ProjectServices.getAllKamProject(this.currentUser.sigle, filters)
            } else {
                return ProjectServices.getAllProject(filters)
            }
        }

            getProjectService(this.topRole, this.filters).then(response => {

                for(const data of response.data) {
                    console.log(data)
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
            });



    },
    mounted: function () {

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var config = {
                columns: [
                    { width: 150, id: 'name',header: [{ text: "Designation" },{ content: "inputFilter" }] },
                    { width: 100, id: 'country',header: [{ text: "Country" },{ content: "inputFilter" }] },
                    { width: 100, id: 'client',header: [{ text: "Client" },{ content: "inputFilter" }] },
                    { width: 100, id: 'kam',header: [{ text: "KAM" },{ content: "inputFilter" }] },
                    { width: 100, id: 'pm',header: [{ text: "PM" },{ content: "inputFilter" }] },
                    { 
                        width: 160, id: 'stage',
                        header: [{ text: "Stage" }, { content: "selectFilter" }],
                        editorType: "select",
                        editable: this.topRole.canUpdateStage,
                        options: ["0. LEAD","1. OPPORTUNITY", "2. RFQ / RFI", "3. BID", "4. FINAL NEGOTIATION", "5. ACCORD CLIENT", "8. COMMANDE", "9. LIVRE", "10. FACTURE", "11. SUSPENDED", "12. PAYÉ"] 
                    },
                    {
                        width: 160, id: 'temp',
                        header: [{ text: "Température" }, { content: "selectFilter" }],
                        editorType: "select",
                        options: ["Froid", "Moyen", "Chaud"]
                    },
                    // { 
                    //     width: 160, id: 'domaine',
                    //     header: [{ text: "Domaine" }, { content: "selectFilter" }],
                    //     editorType: "select",
                    //     options: ["Training", "Product & System", "In-Service", "Improvaero"]
                    // },
                    { width: 100, id: 'charge',header: [{ text: "Charge" },{ content: "inputFilter" }] },
                    {hidden: !this.topRole.financial, width: 100, id: 'ca',header: [{ text: "CA" },{ content: "inputFilter" }] },
                    // { width: 100,header: [{ text: "CA" },{ content: "inputFilter" }] },
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
                    { hidden: true, id: 'id',header: [{ text: "Id" }]},
                ],
                // data: this.gridData,
                selection: "cell",
                editable: this.topRole.canUpdate,
                autoWidth: true,
                resizable: true,
                height: window.innerHeight*0.95,
                keyNavigation: true
            };

        this.grid = new TreeGridDHX(this.$refs.container, config);

        // this.grid.events.on("FilterChange", function(value,colId,filter){
        //     console.log("You've entered "+value+" into the "+colId+" column");
        // });

        // this.grid.selection.setCell(this.grid.data.getItem(this.grid.data.getId(0)), this.grid.config.columns[0]);

        this.grid.data.events.on('Change', (id, status, data) => {

            if(data) {

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
                    project.pm = data.pm;
                    project.etp = data.etp;
                    project.country = data.country;
                    project.stage = data.stage;
                    project.comments = data.comments;
                    project.resource = data.ressource;
                    project.status = data.status;
                    project.start_date = startDate;
                    project.end_date = endDate;
                    project.charge = data.charge;
                    // project.domaine = data.domaine;
                    project.ca = data.ca;
                    if(status === 'update') {
                        ProjectServices.update(id,project)
                        } else if(status === "add") {
                            ProjectServices.create(project)
                        }
                
                } else if(data.type === "task") {
                    project._id = data.parent;
                    project.schedule = {};
                    project.schedule._id = id;
                    project.schedule.scheduleId = id;
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
                    project.schedule.pm = data.pm;
                    project.schedule.etp = data.etp;
                    project.schedule.country = data.country;
                    project.schedule.stage = data.stage;
                    project.schedule.comments = data.comments;
                    // project.schedule.resources = data.resources;
                    project.schedule.status = data.status;
                    project.schedule.charge = data.charge;
                    // project.schedule.domaine = data.domaine;
                    project.schedule.ca = data.ca;
                    if(status === 'update') {
                        ScheduleServices.update(project._id,project)
                    } else if(status === "add") {
                        ScheduleServices.create(project)
                    }
                }
            } /*else {
                this.grid 
            }*/
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


            GridServices.createGrid(data)
            .then(response => {
                this.grid.id = response.data.id;
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
<style>
@import "~dhx-suite/codebase/suite.min.css";
</style>