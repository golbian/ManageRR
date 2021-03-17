<template>
    <div ref="container">
        <div class="btn-group" role="group" v-on:click="changeRole(role)" v-for="role in $store.state.auth.user.roles" :key="role._id">
            <v-btn type="radio" class="btn btn-check" name="btnrole" :value="role._id" color="#0288d1">
                {{role.name}}
            </v-btn>
        </div>
        <div id="layout">
        <modal v-if="showModal" @close="showModal=false" :editedEvent="editedEvent"></modal>
        </div>
    </div>
</template>

<script>
import "dhtmlx-scheduler";
import modal from './Modal.vue';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_editors.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_outerdrag.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_tooltip.js';
import { Tree as TreeDHX, Layout as LayoutDHX} from 'dhx-suite';
// import {Layout as LayoutDHX } from 'dhx-suite';
// import {Toolbar as ToolbarDHX} from 'dhx-suite';

import ProjectServices from '../services/project.service';
import EventServices from '../services/event.service';
// import ScheduleServices from '../services/schedule.service';
// import UserServices from '../services/user.service';
import moment from 'moment';
export default {
    components: {
      modal,
    },
    name: 'scheduler',
    props: {
        events: {
            default () {
                return {events: []}
            }
        }
    },
    data () {
        return {
            tree: null,
            documents: [],
            scheduler: scheduler,
            filters: {
                sort: {
                    value: 1,
                    type: "name",
                },
                search: "",
            },
            editedEvent: {
                text: null,
                deliverable: null,
                insitu: true,
                tps: 8,
                client: null,
            },
            project_select_options: [],
            schedule_select_options: [],
            project_id: null,
            scheduler_data: null,
            focusedItem: null,
            showModal: false,
        }
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        },
        topRole() {
            var getHighestPrivilege = this.$store.state.auth.user.roles.length
            return this.$store.state.auth.user.roles[getHighestPrivilege - 1]
        },
        selectedRole() {
            return this.topRole;
        }
    },
    created: function() {

        this.scheduler.clearAll();

        this.scheduler.deleteMarkedTimespan()

        // var getProjectService = (role, filters) => {
        //     if(role.name === "user") {
        //         return ProjectServices.getAllResourceProject(this.currentUser._id, filters)
        //     } else if(role.name === "pm") {
        //         return ProjectServices.getAllPmProject( this.currentUser.sigle, filters)
        //     } else if (role.name === "kam") {
        //         return ProjectServices.getAllKamProject(this.currentUser.sigle, filters)
        //     } else {
        //         return ProjectServices.getAllProject(filters)
        //     }
        // }

        // var dataProcessing = (response) => {
        //     for (const project of response) {
        //         var doc = {};
        //         doc.items = [];
        //         doc.value = project.name;
        //         doc.id = project._id;
        //         doc.opened = true;
        //         for(const schedule of project.schedules) {
        //             schedule.text = schedule.name;
        //             if(!schedule.tps) {
        //                 schedule.tps = 8;
        //             }
        //             schedule.description = schedule.comments;
        //             schedule.parent_name = project.name;
        //             schedule.start_date = moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').format('YYYY-MM-DD HH:mm');
        //             schedule.end_date =  moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').format('YYYY-MM-DD HH:mm');
        //             schedule.value = schedule.name;
        //             schedule.id = schedule._id;
        //             schedule.icon = {
        //                 "folder": "fas fa-book",
        //                 "openFolder": "fas fa-book-open",
        //                 "file": "fas fa-file"
        //             }
        //             // this.events.push(schedule)
        //             doc.items.push(schedule);
        //         }
        //         this.documents.push(doc);
        //     }
        // }

        this.getProjectService(this.topRole, this.filters).then(response => {
            this.dataProcessing(response.data);
            this.tree.data.parse(this.documents);
        })
    },

    mounted: function () {

        this.scheduler.templates.event_text=function(start, end, event){
            if (event.insitu){
                return "<p class='badge'>"+event.client+"</p><p class='badge'> In-situ</p><p class='badge'>"+event.tps+"</p>"
            } else {
                 return "<p class='badge'>"+event.client+"</p><p class='badge'>"+event.time+"</p>"
            }
        }

        this.scheduler.templates.event_bar_text = function(start,end,event){
            if (event.insitu){
                return "<p class='badge'>"+event.client+"</p><p class='badge'> In-situ</p><p class='badge'>"+event.tps+"</p>"
            } else {
                 return "<p class='badge'>"+event.client+"</p><p class='badge'>"+event.time+"</p>"
            }
        };

        //  dhtmlx.compat("dnd")

        var config = {
				css: "dhx_layout-cell--bordered",
                height: "90vh",
				rows: [
					// {
					// 	id: "header",
					// 	html: "Pointage",
					// 	css: "dhx_layout-cell--border_bottom",
					// 	height: "60px"
					// },
					{
						cols: [
							{
								id: "tree-cell",
								css: "dhx_layout-cell--border_right tree",
								width: "33vw",
                                height: "100%",
							},
							{
								rows: [{
									id: "scheduler-cell",
                                    html:"<div></div>",
                                    width:"66vw",
                                    css: "scheduler"
								},]
							},
						]
					},
				]
			};
            
        var layout = new LayoutDHX("layout", config);

        this.tree = new TreeDHX(null, {
            dragMode:"both",
            dropBehaviour:"sibling",
            // dragCopy: true,
            css: "tree-class"
        });

        this.tree.events.on("itemClick", (id,) => {
            this.editedEvent = this.tree.data.getItem(id)
        });

        this.tree.selection.events.on("AfterSelect", (id) => {
            var event = this.tree.selection.getItem(id);

            this.focusedItem = event;
            this.focusedItem.name = event.value;                
            var parent = this.tree.data.getItem(event.parent);
            // var root = this.tree.data.getItem(event.root);
            this.focusedItem.deliverable = parent.deliverable;
            this.focusedItem.domaine = parent.domaine;
            this.focusedItem.project = event.parent_name;
            this.focusedItem.insitu = true;
            this.focusedItem.task = event.name;
            this.focusedItem.user = this.currentUser.sigle;
            this.focusedItem.pm = event.pm;
            this.focusedItem.kam = event.kam;
        });

        this.scheduler.skin = "material";
        this.scheduler.config.header = [
            "week",
            "month",
            "date",
            "prev",
            "today",
            "next"
        ];

        this.scheduler.attachEvent("onSchedulerReady", () => {
            this.scheduler.templates.event_bar_date = function(start,end,event){
                return "• <b>"+event.tps+" hours</b> ";
            };
            requestAnimationFrame(() => {
            this.scheduler.setCurrentView(new Date(), "month");
            });
        });

        layout.getCell("tree-cell").attach(this.tree);
        layout.getCell("scheduler-cell").attach(this.scheduler);

        this.scheduler.config.first_hour = 9;
        this.scheduler.config.last_hour = 20;
        this.scheduler.config.container_autoresize = true;
        this.scheduler.config.dblclick_create = true;
        this.scheduler.config.details_on_create = false;
        this.scheduler.config.details_on_dblclick = false;
        this.scheduler.config.responsive_lightbox = false;
        this.scheduler.config.touch_tooltip = false;

        this.scheduler.attachEvent("onBeforeLightbox", (id) => {
            this.showModal = true;
            var event = this.getEvent(id);
            if(event.insitu === null || event.insitu === undefined) {
                event.insitu = true
            }

            this.editedEvent = event;
            return false
        })

        this.getEventService(this.topRole).then( response => {
            for(const event of response.data) {
                event.id = event._id
                event.text = event.name
            }
            this.scheduler_data = response.data;
        })

        this.submitEvent = (ev) => {
            console.log(ev)
            if(!ev.createdAt) {
                console.log(ev)
                ev.owner = this.currentUser.id;
                ev.name = ev.project.text;
                ev.tps = ev.project.tps;
                ev.project_id = ev.parent;
                ev.schedule_id = ev._id;
                ev.month = moment(ev.start_date).format("MMMM");
                ev.year = moment(ev.start_date).year();
                EventServices.createEvent(ev).then(data => {
                    this.tree.selection.remove();
                    this.editedEvent = null;
                })
            } else {
                EventServices.updateEvent(ev.id, ev).then(data => {
                    this.tree.selection.remove();
                    this.editedEvent = null;
                })
            }
            console.log(ev)
        }

        this.scheduler.addMarkedTimespan({
            days:  [6,0],
            zones: "fullday",
            css:   "week-end",
            type:  "dhx_time_block"
        });

        this.scheduler.addMarkedTimespan({
            days:  "fullweek",
            zones:[12.5*60, 13.5*60],
            css:   "week-end",
            // type:  "dhx_time_block"
        });
    },
    methods: {
        // updateInsitu(insitu) {
        //     if(insitu === true) {
        //     this.editedEvent.insitu = false
        //     } else {
        //     this.editedEvent.insitu = true
        //     }
        // },
        // submitEvent(ev) {
        //     if(!ev.createdAt) {
        //         // var query = {
        //         //     projectId: ev.project_id,
        //         //     scheduleId: ev.schedule_id
        //         // }
        //         ev.owner = this.currentUser.id;
        //         EventServices.createEvent(ev).then(data => {
        //             console.log(data)
        //             this.tree.selection.remove();
        //             this.editedEvent = {};
        //         })
        //     } else {
        //         EventServices.updateEvent(ev.id, ev).then(data => {
        //             console.log(data)
        //             this.tree.selection.remove();
        //             this.editedEvent = {};
        //         })
        //     }
        // },
        
        dataProcessing (response) {
            this.documents = [];
            for (const project of response) {
                var doc = {};
                doc.items = [];
                doc.value = project.name;
                doc.id = project._id;
                doc.opened = true;
                for(const schedule of project.schedules) {
                    schedule.text = schedule.name;
                    if(!schedule.tps) {
                        schedule.tps = 8;
                    }
                    schedule.description = schedule.comments;
                    schedule.parent_name = project.name;
                    schedule.start_date = moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').format('YYYY-MM-DD HH:mm');
                    schedule.end_date =  moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').format('YYYY-MM-DD HH:mm');
                    schedule.value = schedule.name;
                    schedule.id = schedule._id;
                    schedule.icon = {
                        "folder": "fas fa-book",
                        "openFolder": "fas fa-book-open",
                        "file": "fas fa-file"
                    }
                    // this.events.push(schedule)
                    doc.items.push(schedule);
                }
                this.documents.push(doc);
            }
        },
        getProjectService(role, filters) {
            console.log(this.currentUser)
            if(role.name === "user") {
                return ProjectServices.getAllResourceProject(this.currentUser._id, filters)
            } else if(role.name === "pm") {
                return ProjectServices.getAllPmProject( this.currentUser.sigle, filters)
            } else if (role.name === "kam") {
                return ProjectServices.getAllKamProject(this.currentUser.sigle, filters)
            } else {
                return ProjectServices.getAllProject(filters)
            }
        },
        getEventService(role, filters) {
            console.log(this.currentUser)
            if(role.name !== "admin") {
                return EventServices.getAllOwnerEvents(this.currentUser.sigle, filters)
            } else {
                return EventServices.getAllEvents()
            }
        },
        changeRole(role) {
            this.getProjectService(role, this.filters).then(response => {
                this.dataProcessing(response.data);
                this.tree.data.parse(this.documents);
            })
        },
        getEvent(id) {
            if(this.focusedItem) {
                var event = this.scheduler.getEvent(id);

                this.focusedItem.start_date = event.start_date;
                this.focusedItem.end_date = event.end_date;

                // this.focusedItem.pointage = 
                console.log(event)
                return this.focusedItem;
            } else {
                return this.scheduler.getEvent(id)
            }
        }
    },
    watch: {
        documents: function() {
            var project_options = [];
            var schedule_options = {};
            for(const project of this.documents) {
                schedule_options[project.id] = []
                var project_data = {}
                project_data.key = project.id
                project_data.label = project.value;
                project_options.push(project_data)

                for(const schedule of project.items) {
                    var schedule_data = {};
                    schedule_data.key = schedule.id
                    schedule_data.label = schedule.text
                    schedule_options[project.id].push(schedule_data)
                }
                this.schedule_select_options = schedule_options
            }

            this.project_select_options = project_options;
        },
        scheduler_data: function() {
            this.scheduler.parse(this.scheduler_data);
        },
        showModal: function() {
            this.scheduler.clearAll();
            this.getEventService(this.topRole).then( response => {
            for(const event of response.data) {
                event.id = event._id
                event.text = event.name
            }
            this.scheduler_data = response.data;
        })
        }
    }
}
</script>
 
<style>
    @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler_material.css";
    @import "~dhx-suite/codebase/suite.css";

    body {
		margin: 0px;
		padding: 0px;
	}

    .week-end {
        background-color: #e8e8e87d;
    }

    #scheduler_container{ 
        margin-left: 33vw;
        background-color: white;
		border-left: 1px solid #EBE9E9;
		border-right: 1px solid #EBE9E9;
    }

    #tree_container{
        position: absolute;
        width: 33vw;
    }

    .card-text .text-muted {
        color: white !important;
    }

    .tree {
        overflow: scroll;
    }

    .tree-class {
        padding: 20px;
    }
    .tree-class .dhx_tree-list-item__text {
        color: #0288d1;
    }
    .tree-class .dhx_tree-folder .dhx_tree-list-item__text {
        color: #0ab169;
    }
</style>