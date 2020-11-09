<template>
    <div ref="container">
        <div id="layout">
            <modal name="lightboxModal" height="auto" :scrollable="true">
                    <form name="form" id="form"  class="m-5" v-on:submit.prevent="updateEvent(editedEvent)">
                    <h4 v-if="editedEvent.id ==''" class="text-center">Create an event</h4>
                    <h4 v-else class="text-center">Update an Event</h4>
                    <div class="form-group">
                        <v-combobox
                            :items="documents"
                            :item-text="documents.value"
                            :item-value="documents.id"
                            label="Filters..."
                            multiple
                            outlined
                            chips
                        ></v-combobox>
                    </div>
                    <div class="form-group">
                            <label for="text">Name</label>
                            <input
                            id="input_text"
                            v-model="editedEvent.text"
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
                    <div class="form-group col-sm-12">
                         <v-slider
                            v-model="editedEvent.tps"
                            step="1"
                            ticks="always"
                            tick-size="4"
                            min="0"
                            max="8"
                        ></v-slider>
                    </div>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary btn-block">Save</button>
                    </div>
                </form>
            </modal>
        </div>
    </div>
</template>

<script>
import "dhtmlx-scheduler/codebase/dhtmlxscheduler";
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
            comboBox: null,
            window: null,
            documents: [],
            user: {},
            events: [],
            submitted: false,
            successful: false,
            editedEvent: {
                // project: {},
                // schedule: {},
                text: null,
                deliverable: null,
                insitu: true,
                tps: 8,
            },
            project_select_options: [],
            schedule_select_options: [],
            project_id: null,
            scheduler_data: [],
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

        this.tree = new TreeDHX("tree_container",{
            dragMode:"both",
            dropBehaviour:"sibling",
            // dragCopy: true,
            css: "tree-class"
        });

        this.tree.events.on("itemClick", (id, e) => {
            this.editedEvent = this.tree.data.getItem(id)
            console.log(this.editedEvent)
        });
        // var form = document.getElementById("form");
        // var html = function(id) { return document.getElementById(id); };
 
        // scheduler.showLightbox = (id) => {
        //     var ev = scheduler.getEvent(id);
        //     this.editedEvent = ev;
        //     scheduler.startLightbox(id, html("form"));
        //     html("input_name").value = this.editedEvent.text;
        //     document.getElementById("input_deliverable").value = this.editedEvent.deliverable;
        //     document.getElementById("input_insitu").value = this.editedEvent.insitu;
        //     document.getElementById("time_picker").value = this.editedEvent.time;
        //     document.getElementById("comboBox").value = this.editedEvent.filter;
        // }
        // //needs to be attached to the 'save' button
        // function save_form() {
        //     var ev = scheduler.getEvent(scheduler.getState().lightbox_id);
        //     this.editedEvent.text = document.getElementById("input_name").value;
        //     this.editedEvent.deliverable = document.getElementById("input_deliverable").value;
        //     this.editedEvent.insitu = document.getElementById("input_insitu").value;
        //     this.editedEvent.time = document.getElementById("time_picker").value;
        //     this.editedEvent.filter = document.getElementById("comboBox").value;
        //     scheduler.endLightbox(true, form);
        // }
        // //needs to be attached to the 'cancel' button
        // function close_form(argument) {
        //     scheduler.endLightbox(false, form);
        // }
        
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
        // scheduler._init_event('onExternalDragIn');
        scheduler.config.touch_tooltip = false;

        scheduler.attachEvent("onBeforeLightbox", (id) => {
            this.$modal.show('lightboxModal')
            return false
        })

        EventServices.getAllOwnerEvents(this.currentUser.id).then( response => {
            for(const event of response.data) {
                event.id = event._id
                event.text = event.activityName
            }
            this.scheduler_data = response.data;
        })

        scheduler.attachEvent("onEventAdded", (id,ev)=> {
            var query = {
                projectId: ev.project_id,
                scheduleId: ev.schedule_id
            }
            ScheduleServices.getSchedule(query).then(response => {
                var schedule = response.data.schedules[0];
                ev.owner = this.currentUser.id
                ev.client = schedule.client;
                ev.tps = schedule.duration;
                ev.activityName = schedule.name;
                console.log(ev)
                EventServices.createEvent(ev).then(data => {
                    console.log(data)
                }).catch(err => {
                    console.log(err)
                })
            })
        });

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

        scheduler.attachEvent("onEventChanged", (id,ev) => {
            EventServices.updateEvent(id, ev)
        });

        scheduler.attachEvent("onDragEnd", (id,ev) => {
            var event = scheduler.getEvent(id)
            EventServices.updateEvent(id, event)
        })
         
        
    },
    methods: {
        updateInsitu(insitu) {
            if(insitu === true) {
            this.editedEvent.insitu = false
            } else {
            this.editedEvent.insitu = true
            }
        },
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

            // var update_select_options = function(select, options) {
            //     select.options.length = 0;
            //     for (var i=0; i<options.length; i++) {
            //         var option = options[i];
            //         select[i] = new Option(option.label, option.key);
            //     }
            // };

            // var parent_onchange = (event) => {
            //     this.project_id = event;
            //     var new_child_options = this.schedule_select_options[this.project_id];
            //     update_select_options(scheduler.formSection('Activity').control, new_child_options);
            // };
        
            // scheduler.attachEvent("onBeforeLightbox", (id) => {
            //     var ev = scheduler.getEvent(id);
            //     if (!ev.schedule_id) {
            //         this.project_id = this.project_select_options[0].key;
            //         var new_child_options = this.schedule_select_options[this.project_id];
            //         update_select_options(scheduler.formSection('Activity').control, new_child_options);
            //     }
            //     return true;
            // });

            // scheduler.config.lightbox.sections = [
            //     {name: "Project", height: 72, type:"combo", options: this.project_select_options, map_to:"project_id", onchange:parent_onchange, filtering: true},
            //     {name:"Activity", height: 72, type:"select", options: this.schedule_select_options, map_to:"schedule_id", filtering: true},
            //     {name:"Livrable/Lot", height: 72, map_to: "deliverable", type:"textarea"},
            //     {name:"In-Situ", height: 72, map_to: "insitu", type:"select",  options: [{key: true, label: "yes"} , {key:false, label: "no"}], vertical: false},
            //     {name:"time", height:72, type:"time", map_to:"auto"},
            // ];
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