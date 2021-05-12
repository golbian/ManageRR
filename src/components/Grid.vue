<template>
<div ref="layout">
    <div id="menu"></div>
    <div ref="container" id='container' class="widget-box"></div>
</div>
</template>

<script>
import { Grid as GridDHX} from "dhx-suite";
// import {TreeGrid as TreeGridDHX } from 'dhx-suite';
import { Toolbar as ToolbarDHX } from 'dhx-suite';

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
            },
            groupsTitle: {
                project: [
                   "client","contact", "country","stage", "kam","pm", "temp","domaine","cmde","cmde_link"
                ],
                financial: [
                    "bl", "bl_chrono","facture", "facture_link", "facture_id","facture_date", "regt_initial","regt_expect", "regt_final"
                ],
                resources: [
                    "charge", "rate","etp", "ca", "debours","start_date", "end_date"
                ],
                info: [
                    "comments","duration"
                ],
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
                return ProjectServices.getAllResourceProject(this.currentUser.id, filters)
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
        // window.addEventListener("keydown", e => {
        //     console.log(String.fromCharCode(e.keyCode));
        // });

        var router = this.$router;

        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var config = {
                columns: [
                    { hidden: false, width: 150, id: 'wbs',header: [{ text: "<span class='headers-primary' >Réference</span>" },{ content: "inputFilter" }],editable: false, htmlEnable: true },
                    { hidden: false, width: 150, id: 'name',header: [{ text: "<span class='headers-primary' >Designation</span>" },{ content: "inputFilter" }] ,htmlEnable: true},
                    { hidden: false, width: 100, id: 'client',header: [{ text: "<span class='headers-primary' >Client</span>"  },{ content: "inputFilter" }] },
                    { hidden: false, width: 100, id: 'contact',header: [{ text: "<span class='headers-primary' >Contact</span>"  },{ content: "inputFilter" }] },
                    { hidden: false, width: 100, id: 'country',header: [{ text: "<span class='headers-primary' >Country</span>"  },{ content: "inputFilter" }] },
                    { 
                        hidden: false, 
                        width: 160, id: 'stage',
                        header: [{ text: "<span class='headers-secondary' >Stage</span>" }, { content: "selectFilter" }],
                        editorType: "select",
                        editable: !this.topRole.canUpdateStage,
                        options: ["0. LEAD","1. OPPORTUNITY", "2. RFQ / RFI", "3. BID", "4. FINAL NEGOTIATION", "5. ACCORD CLIENT", "8. COMMANDE", "9. LIVRE", "10. FACTURE", "11. SUSPENDED", "12. PAYÉ"] 
                    },
                    { hidden: false, width: 100, id: 'kam',header: [{ text: "<span class='headers-secondary' >KAM</span>" },{ content: "inputFilter" }] },
                    { hidden: false, width: 100, id: 'pm',header: [{ text: "<span class='headers-secondary' >PM</span>" },{ content: "inputFilter" }] },
                    {
                        hidden: false, 
                        width: 160, id: 'temp',
                        header: [{ text: "<span class='headers-secondary' >TEMP</span>" }, { content: "selectFilter" }],
                        editorType: "select",
                        options: ["FROID", "MOYEN", "CHAUD"]
                    },
                    { 
                        hidden: false, 
                        width: 160, id: 'domaine',
                        header: [{text :"<span class='headers-secondary' >Domaine</span>"}, { content: "selectFilter" }],
                        editorType: "select",
                        options: ["Training", "Product & System", "In-Service", "Improvaero"]
                    },
                    { hidden: false, width: 100, id: 'cmde',header: [{ text: "<span class='headers-primary' >Cmde</span>"  },{ content: "inputFilter" }] },
                    { hidden: false, width: 100, id: 'cmde_link',header: [{ text: "<span class='headers-primary' >Cmde_link</span>"  },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'bl',header: [{ text: "<span class='headers-primary' >BL</span>"  },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'bl_chrono',header: [{ text: "<span class='headers-primary' >BL_chrono</span>"  },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'facture',header: [{ text: "<span class='headers-tertiary' >Facture</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'facture_link',header: [{ text: "<span class='headers-tertiary' >Facture_link</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'facture_id',header: [{ text: "<span class='headers-tertiary' >Facture_id</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'facture_date',header: [{ text: "<span class='headers-tertiary' >Facture_date</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'regt_initial',header: [{ text: "<span class='headers-tertiary' >Regt_Initial</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'regt_expect',header: [{ text: "<span class='headers-tertiary' >Regt_Expect</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'regt_final',header: [{ text: "<span class='headers-tertiary' >Regt_Final</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'charge',header: [{ text: "<span class='headers-tertiary' >Charge</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'rate',header: [{ text: "<span class='headers-tertiary' >Rate</span>" },{ content: "inputFilter" }] },
                    {hidden: !this.topRole.financial, width: 100, id: 'ca',header: [{ text: "<span class='headers-tertiary' >CA</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100,id: 'etp', header: [{ text: "<span class='headers-tertiary' >ETP</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100,id: 'debours', header: [{ text: "<span class='headers-tertiary' >Debours</span>" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'start_date',header: [{ text: "<span class='headers-tertiary' >Début</span>" },{ content: "inputFilter" }], type: 'date'},
                    { hidden: true, width: 100, id: 'end_date',header: [{ text: "<span class='headers-tertiary' >Fin</span>" },{ content: "inputFilter" }], type: 'date'},
                    {
                        hidden: true, 
                        width: 100, id: 'status',
                        header: [{ text: "<span class='headers-secondary'Status</span>" }, { content: "selectFilter" }],
                        editorType: "select",
                        options: ["Renewal", "Extension", "New Contract"]
                    },
                    { hidden: true, width: 100, id: 'comments',header: [{ text: "Comments" },{ content: "inputFilter" }] },
                    // { width: 100, id: 'ressource',header: [{ text: "Ressource" },{ content: "inputFilter" }] },
                    { hidden: true, width: 100, id: 'duration',header: [{ text: "Jours" },{ content: "inputFilter" }]},
                    { hidden: true, id: 'progress',header: [{ text: "Progress" }]},
                    { hidden: true, id: 'parent',header: [{ text: "Parent" }]},
                    { hidden: true, id: 'id',header: [{ text: "Id" }]},
                ],
                rowCss: function (row) {
                    return row.type === "project" ? "project_row" : "task_row"
                },
                // data: this.gridData,
                selection: "cell",
                editable: this.topRole.canUpdate,
                // autoWidth: true,
                resizable: true,
                keyNavigation: true,
                height: window.screen.availHeight*0.80,
            };

        this.grid = new GridDHX(this.$refs.container, config);

        // this.grid.enableAutoWidth(true,500);

        var data = [
            {
                "id": "projectView",
                "html": "<span>Project</span>",
                "type": "button",
                "twoState": true,
            },
            {
                "type": "separator"
            },        
            {
                "id": "financialView",
                "html": "<span>Financial</span>",
                "type": "button",
                "twoState": true,
            },
            {
                "type": "separator"
            },        
            {
                "id": "resourceView",
                "html": "<span>Resources</span>",
                "type": "button",
                "twoState": true,
            },
            {
                "type": "separator"
            },        
            {
                "id": "infoView",
                "html": "<span>Information</span>",
                "type": "button",
                "twoState": true,
            },
        ];
 
        var toolbar = new ToolbarDHX("menu");
        toolbar.data.parse(data);
        
        toolbar.events.on("Click", (id) => {
            switch (id) {
                case "projectView": {
                    let button = toolbar.data.getItem('projectView')
                    if(button.active == true) {
                        for( let id of this.groupsTitle.project) {
                            this.grid.showColumn(id);
                        }
                    } else {
                        for( let id of this.groupsTitle.project) {
                            this.grid.hideColumn(id);
                        }
                    }
                    this.grid.paint();
                    break;
                }
                case "financialView": {
                    let button = toolbar.data.getItem('financialView')
                    if(button.active == true) {
                        for( let id of this.groupsTitle.financial) {
                            this.grid.showColumn(id);
                        }
                    } else {
                        for( let id of this.groupsTitle.financial) {
                            this.grid.hideColumn(id);
                        }
                    }
                    this.grid.paint();
                    break;
                }
                case "resourceView": {
                    let button = toolbar.data.getItem('resourceView')
                    if(button.active == true) {
                        for( let id of this.groupsTitle.resources) {
                            this.grid.showColumn(id);
                        }
                    } else {
                        for( let id of this.groupsTitle.resources) {
                            this.grid.hideColumn(id);
                        }
                    }
                    this.grid.paint();
                    break;
                }
                case "infoView": {
                    let button = toolbar.data.getItem('infoView')
                    if(button.active == true) {
                        for( let id of this.groupsTitle.info) {
                            this.grid.showColumn(id);
                        }
                    } else {
                        for( let id of this.groupsTitle.info) {
                            this.grid.hideColumn(id);
                        }
                    }
                    this.grid.paint();
                    break;
                }
            }
        });

        this.grid.events.on("CellClick", (row,column,e) => {
            // if(row.type === "project") {
            //     if(row.schedules) {
            //         for(const wp of row.schedules) {
            //             console.log(wp);
            //             if(this.grid.isRowHidden(wp._id)) {
            //                 this.grid.showRow(wp._id);
            //             } else {
            //                 this.grid.hideRow(wp._id);
            //             }
            //         }
            //     }
            // }

            if(column.id === "wbs" && row.type === "project") {
                router.push("/project/"+ row._id);
            }
        });

        // for(let title of this.groupsTitle.primary) {
        //     var doc = document.querySelector('[title="'+ title +'"]');
        //     doc.classList.add("header_primary");
        // }

        // for(let title of this.groupsTitle.secondary) {
        //     var doc = document.querySelector('[title="'+ title +'"]');
        //     doc.classList.add("header_secondary");
        // }

        // for(let title of this.groupsTitle.tertiary) {
        //     var doc = document.querySelector('[title="'+ title +'"]');
        //     doc.classList.add("header_tertiary");
        // }

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
                    project.wbs = data.wbs;
                    project.name = data.name;
                    // project.type = data.type;
                    project.client = data.client;
                    project.contact = data.contact;
                    project.temp = data.temp;
                    project.kam = data.kam;
                    project.pm = data.pm;
                    project.etp = data.etp;
                    project.country = data.country;
                    project.stage = data.stage;
                    project.comments = data.comments;
                    // project.resource = data.ressource;
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
    },
    watch:{
        '$route' (to, from){
            console.log(to, from);
            this.grid.destructor() ;
        },
    },
  }
</script>
<style>
    @import "~dhx-suite/codebase/suite.min.css";

    .widget-box {
        height: 88vh;
    }

    .grid_custom {
        overflow-x: scroll;
    }
    
    .project_row {
        background: RGB(26, 149, 219, 0.8);
    }

    .dhx_first-column-cell {
        background: RGB(26, 149, 219, 0.8);
    }

    .header_primary{
        background: RGB(26, 149, 219, 0.8);
    }

    .header_secondary{
        background: RGB(224, 189, 11);
    }

    .header_tertiary{
        background: RGB(204, 111, 4);
    }

    .task_row {
        background: RGB(57, 81, 94, 0.3);
    }

    .fa-external-link-alt {
        cursor: pointer;
        font-size: 14px;
        opacity: 0.5;
        margin-left: 15px;
        padding: 5px;
    }
</style>