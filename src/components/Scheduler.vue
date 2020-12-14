<template>
    <div ref="container">
        <div id="layout">
            <modal name="lightboxModal" height="auto" :scrollable="true">
                    <form name="form" id="form"  class="m-5" v-on:submit.prevent="submitEvent(editedEvent)">
                    <h4 v-model="editedEvent.name" class="text-center">{{editedEvent.name}}</h4>
                    <div class="form-group">
                            <label for="text">Name</label>
                            <input
                            id="input_text"
                            v-model="editedEvent.name"
                            v-validate="'required|min:3|max:15'"
                            type="text"
                            class="form-control"
                            name="text"
                            />
                            <div
                            v-if="submitted && errors.has('text')"
                            class="alert-danger"
                            >{{errors.first('text')}}</div>
                    </div>
                    <div class="form-group">
                            <label for="client">Client</label>
                            <input
                            id="input_client"
                            v-model="editedEvent.client"
                            v-validate="'required|min:3|max:25'"
                            type="text"
                            class="form-control"
                            name="client"
                            />
                            <div
                            v-if="submitted && errors.has('client')"
                            class="alert-danger"
                            >{{errors.first('client')}}</div>
                    </div>
                    <div class="form-group">
                            <label for="deliverable">Livrable</label>
                            <input
                            id="input_deliverable"
                            v-model="editedEvent.deliverable"
                            v-validate="'required|min:3|max:25'"
                            type="text"
                            class="form-control"
                            name="deliverable"
                            />
                            <div
                            v-if="submitted && errors.has('deliverable')"
                            class="alert-danger"
                            >{{errors.first('deliverable')}}</div>
                    </div>
                    <div class="form-group roles-check row  mt-5">

                    <div class="form-group col-sm-8 text-center">
                        <label for="tps">Time Spent</label>
                        <input 
                        id="input_name"
                            v-model="editedEvent.tps"
                            type="range"
                            class="form-control"
                            name="tps"
                            min="0"
                            max="8"
                        >
                        <p><strong>{{editedEvent.tps}} hours</strong></p>
                    </div>
                    <div class="col-sm-4 mt-4">
                        <toggle-button id="input_insitu" @change="updateInsitu(editedEvent.insitu)" color="#007bff" :width="100" :height="45" :value="editedEvent.insitu" :sync="true" :labels="{checked: 'In-Situ', unchecked: 'In-Situ'}" />
                    </div>
                    </div>
                    <div class="form-group">
                        <button v-if="!editedEvent.createdAt" class="btn btn-primary btn-block">Create</button>
                        <button v-else class="btn btn-primary btn-block">Save</button>
                    </div>
                </form>
            </modal>
        </div>
    </div>
</template>

<script>
import "dhtmlx-scheduler";
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_editors.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_outerdrag.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_tooltip.js';
import { Tree as TreeDHX} from 'dhx-suite';
import {Layout as LayoutDHX } from 'dhx-suite';
import {Toolbar as ToolbarDHX} from 'dhx-suite';

import ProjectServices from '../services/project.service';
import EventServices from '../services/event.service';
import ScheduleServices from '../services/schedule.service';
import UserServices from '../services/user.service';
import moment from 'moment';
export default {
    data () {
        return {
            tree: null,
            scheduler: null,
            timePicker: null,
            documents: [],
            user: {},
            events: [],
            submitted: false,
            successful: false,
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
        }
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        },
    },
    created: function() {

        scheduler.clearAll();

        scheduler.deleteMarkedTimespan()

        var dataProcessing = (response) => {
            for (const project of response) {
                var doc = {};
                doc.items = [];
                doc.value = project.name;
                doc.id = project._id;
                doc.opened = true;
                for(const schedule of project.schedules) {
                    var data = {};
                    var item = {};
                    if(schedule.resources.indexOf(this.currentUser._id)) {
                        for( let i = 0 ; i < schedule.duration ; i++ ) {
                            data.text = schedule.name;
                            // data.holder = schedule.resources[0].username;
                            if(!data.tps) {
                                data.tps = 8;
                            }
                            data.description = schedule.comments;
                            data.parent_name = project.name;
                            var workTime = moment.duration(this.user.value ,'hours').add(1,'hours')
                            data.start_date = moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').add(i, 'd').format('YYYY-MM-DD HH:mm');
                            data.end_date =  moment(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]').add(i, 'd').format('YYYY-MM-DD HH:mm');
                            data.start_date = data.start_date.replace("00:00", '09:00');
                            data.end_date = data.end_date.replace("00:00", moment(data.start_date).add(workTime).format('HH:mm'));

                            this.events.push(data);
                        }
                    }
                    item = data;
                    item.value = schedule.name;
                    item.id = schedule._id;
                    item.icon = {
                        "folder": "fas fa-book",
                        "openFolder": "fas fa-book-open",
                        "file": "fas fa-file"
                    }
                    doc.items.push(item);
                }
                this.documents.push(doc);
            }
        }

        ProjectServices.getAllOwnerProject(this.currentUser.sigle).then(res => {
            dataProcessing(res.data);
        })
    },

    mounted: function () {

        scheduler.templates.event_text=function(start, end, event){
            if (event.insitu){
                return "<p class='badge'>"+event.client+"</p><p class='badge'> In-situ</p><p class='badge'>"+event.tps+"</p>"
            } else {
                 return "<p class='badge'>"+event.client+"</p><p class='badge'>"+event.time+"</p>"
            }
        }

        scheduler.templates.event_bar_text = function(start,end,event){
            if (event.insitu){
                return "<p class='badge'>"+event.client+"</p><p class='badge'> In-situ</p><p class='badge'>"+event.tps+"</p>"
            } else {
                 return "<p class='badge'>"+event.client+"</p><p class='badge'>"+event.time+"</p>"
            }
        };

        //  dhtmlx.compat("dnd")

        var config = {
				css: "dhx_layout-cell--bordered",
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
                                height: "95vh"
							},
							{
								rows: [{
									id: "scheduler-cell",
                                    html:"<div></div>",
                                    width:"66vw",
                                    height: "90vh",
                                    css: "scheduler"
								},]
							},
						]
					},
					{
						id: "footer",
						html: "Footer",
						css: "dhx_layout-cell--border_top",
						gravity: false,
						height: "60px"
					}
				]
			};
            
        var layout = new LayoutDHX("layout", config);

        this.tree = new TreeDHX(null, {
            dragMode:"both",
            dropBehaviour:"sibling",
            // dragCopy: true,
            css: "tree-class"
        });

        // this.tree.events.on("itemClick", (id,) => {
        //     this.editedEvent = this.tree.data.getItem(id)
        // });

        this.tree.selection.events.on("AfterSelect", (id) => {
            var event = this.tree.selection.getItem();


            this.focusedItem = {
                text: event.value,
                tps: event.tps,
                id: event.id,
                name: event.text,
                insitu: true,
            }
        });

        scheduler.skin = "material";
        scheduler.config.header = [
            "week",
            "month",
            "date",
            "prev",
            "today",
            "next"
        ];

        // scheduler.config.multi_day = true;
        
        // scheduler.init("scheduler", new Date(), "week");

        scheduler.attachEvent("onSchedulerReady", () => {
            scheduler.templates.event_bar_date = function(start,end,event){
                return "• <b>"+event.tps+" hours</b> ";
            };
            requestAnimationFrame(() => {
            scheduler.setCurrentView(new Date(), "month");
            });
        });

        layout.getCell("tree-cell").attach(this.tree);
        layout.getCell("scheduler-cell").attach(scheduler);

        scheduler.config.first_hour = 9;
        scheduler.config.last_hour = 20;
        scheduler.config.container_autoresize = true;
        scheduler.config.dblclick_create = true;
        scheduler.config.details_on_create = true;
        scheduler.config.details_on_dblclick = true;
        scheduler.config.responsive_lightbox = true;
        scheduler.config.touch_tooltip = false;

        scheduler.attachEvent("onBeforeLightbox", (id) => {
            this.$modal.show('lightboxModal')
            var event = this.getEvent(id);
            if(event.insitu === null || event.insitu === undefined) {
                event.insitu = true
            }

            this.editedEvent = event;
            return false
        })

        EventServices.getAllOwnerEvents(this.currentUser.id).then( response => {
            for(const event of response.data) {
                event.id = event._id
                event.text = event.name
                console.log(event)
            }
            this.scheduler_data = response.data;
        })

        // this.submitEvent = (ev) => {
        //     if(!ev.createdAt) {
        //         var query = {
        //             projectId: ev.project_id,
        //             scheduleId: ev.schedule_id
        //         }
        //         ev.owner = this.currentUser.id;
        //         ev.name = ev.project.text;
        //         ev.tps = ev.project.tps;
        //         EventServices.createEvent(ev).then(data => {
        //             this.tree.selection.remove();
        //             this.editedEvent = null;
        //         })
        //     } else {
        //         EventServices.updateEvent(ev.id, ev).then(data => {
        //             this.tree.selection.remove();
        //             this.editedEvent = null;
        //         })
        //     }
        // }

        scheduler.addMarkedTimespan({
            days:  [6,0],
            zones: "fullday",
            css:   "week-end",
            type:  "dhx_time_block"
        });

        scheduler.addMarkedTimespan({
            days:  "fullweek",
            zones:[12.5*60, 13.5*60],
            css:   "week-end",
            // type:  "dhx_time_block"
        });
    },
    methods: {
        updateInsitu(insitu) {
            if(insitu === true) {
            this.editedEvent.insitu = false
            } else {
            this.editedEvent.insitu = true
            }
        },
        submitEvent(ev) {
            if(!ev.createdAt) {
                var query = {
                    projectId: ev.project_id,
                    scheduleId: ev.schedule_id
                }
                ev.owner = this.currentUser.id;
                EventServices.createEvent(ev).then(data => {
                    this.tree.selection.remove();
                    this.editedEvent = {};
                })
            } else {
                EventServices.updateEvent(ev.id, ev).then(data => {
                    this.tree.selection.remove();
                    this.editedEvent = {};
                })
            }
        },
        getEvent(id) {
            if(this.focusedItem) {
                var event = scheduler.getEvent(id)
                this.focusedItem.start_date = event.start_date;
                this.focusedItem.end_date = event.end_date;
                return this.focusedItem;
            } else {
                return scheduler.getEvent(id)
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
        events: function() {
            this.tree.data.parse(this.documents);
            console.log(this.documents)
        },
        scheduler_data: function() {
            scheduler.parse(this.scheduler_data);
        }
    }
}
</script>
 
<style>
    @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler_material.css";
    @import "~dhx-tree/codebase/tree.min.css";
    @import "~dhx-suite/codebase/suite.css";

    body {
		margin: 0px;
		padding: 0px;
		overflow: hidden;
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