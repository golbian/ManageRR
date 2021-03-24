<template>
<div ref="container" id='container' class="widget-box w-100 h-100">
</div>
</template>

<script>
import { Grid as GridDHX} from 'dhx-suite';
// import {TreeGrid as TreeGridDHX } from 'dhx-suite';

// import GridServices from '../services/grid.service';
import EventServices from '../services/event.service';
import moment from 'moment';

export default {
    data() {
        return {
            grid:null,
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

            this.getEventService(this.topRole, this.currentUser).then(response => {
                for(const data of response.data) {
                    data.id = data._id;
                    data.start_date = formatDate(data.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    data.end_date = formatDate(data.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    this.dataset.push(data);
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
                    { width: 150, id: 'user',header: [{ text: "User" },{ content: "inputFilter" }] },
                    { width: 150, id: 'project',header: [{ text: "Project" },{ content: "inputFilter" }] },
                    { width: 150, id: 'task',header: [{ text: "Task" },{ content: "inputFilter" }] },
                    { width: 150, id: 'pm',header: [{ text: "Pm" },{ content: "inputFilter" }] },
                    { width: 150, id: 'kam',header: [{ text: "Kam" },{ content: "inputFilter" }] },
                    { width: 150, id: 'client',header: [{ text: "Client" },{ content: "inputFilter" }] },
                    { width: 150, id: 'pointage',header: [{ text: "Pointings/Month" },{ content: "inputFilter" }] },
                    { width: 150, id: 'month',header: [{ text: "Month" },{ content: "inputFilter" }] },
                    { width: 150, id: 'year',header: [{ text: "Year" },{ content: "inputFilter" }] },
                    { width: 150, id: 'insitu',header: [{ text: "Insitu" }]},
                    // { width: 150, id: 'domain',header: [{ text: "Domaine" },{ content: "inputFilter" }] },
                    // { hidden: true, id: 'parent',header: [{ text: "Parent" }]},
                    // { hidden: true, id: '_id',header: [{ text: "Id" }]},
                ],
                // data: this.gridData,
                selection: "cell",
                editable: this.topRole.canUpdate,
                autoWidth: true,
                resizable: true,
                height: window.innerHeight*0.95,
                // keyNavigation: true
            };

        this.grid = new GridDHX(this.$refs.container, config);

        // this.grid.events.on("FilterChange", function(value,colId,filter){
        //     console.log("You've entered "+value+" into the "+colId+" column");
        // });

        // this.grid.selection.setCell(this.grid.data.getItem(this.grid.data.getId(0)), this.grid.config.columns[0]);

        this.grid.data.events.on('Change', (id, status, data) => {
            if(data) {
                var event = {};
                // var startDate = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                // var endDate = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');

                event._id = data.id;
                event.project = data.project;
                event.task = data.task;
                event.user = data.user;
                event.client = data.client;
                event.pointage = data.pointage;
                event.kam = data.kam;
                event.pm = data.pm;
                event.month = data.month;
                event.year = data.year;
                event.domaine = data.domain
                // event.start_date = startDate;
                // event.end_date = endDate;
                if(status === 'update') {
                    EventServices.update(id,event)
                } else if(status === "add") {
                    EventServices.create(event)
                }
            }
        });
    },

    methods: {
    getEventService(role, filters) {
            if(role.name === "user") {
                return EventServices.getAllOwnerEventsPerMonth(this.currentUser.sigle, filters)
            } else if(role.name === "pm") {
                return EventServices.getAllPmEventsPerMonth( this.currentUser.sigle, filters)
            } else if (role.name === "kam") {
                return EventServices.getAllKamEventsPerMonth(this.currentUser.sigle, filters)
            } else {
                return EventServices.getAllEventsPerMonth(filters)
            }
        },
    },
  }
</script>
<style>
@import "~dhx-suite/codebase/suite.min.css";
</style>