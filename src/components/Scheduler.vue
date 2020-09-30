<template>
    <div ref="container">
    <div id="layout"></div>
    </div>
</template>
 
<script>
import "dhtmlx-scheduler/codebase/dhtmlxscheduler.js";
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_outerdrag.js';
import { Tree as TreeDHX} from 'dhx-suite';
import {Layout as LayoutDHX } from 'dhx-suite';

import ProjectServices from '../services/project.service';
import EventServices from '../services/event.service';
import ScheduleServices from '../services/schedule.service';
import UserServices from '../services/user.service';
import moment from 'moment';
export default {
    data () {
        return {
            tree: null,
            documents: [],
            user: {},
            events: [],
            project_select_options: [],
            schedule_select_options: [],
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

        UserServices.getUser(this.currentUser.id).then(res => {
            this.user = res.data;
        }).catch(err => {
            console.log(err)
        })
    },

    mounted: function () {

        dhtmlx.compat("dnd")

        var config = {
				css: "dhx_layout-cell--bordered",
				rows: [
					{
						id: "header",
						html: "Pointage",
						css: "dhx_layout-cell--border_bottom",
						height: "60px"
					},
					{
						cols: [
							{
								id: "tree-cell",
								css: "dhx_layout-cell--border_right tree",
								width: "33vw",
                                height: "100vh"
							},
							{
								rows: [{
									id: "scheduler-cell",
                                    html:"<div></div>",
                                    width:"66vw",
                                    height: "100vh",
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
        
        scheduler.skin = "material";
        scheduler.config.header = [
            "day",
            "week",
            "month",
            "date",
            "prev",
            "today",
            "next"
        ];

        // scheduler.config.multi_day = true;
        
        // scheduler.init("scheduler", new Date(), "week");

        scheduler.attachEvent("onSchedulerReady", function () {
            requestAnimationFrame(function(){
            scheduler.setCurrentView(new Date(), "week");
            });
        });

        layout.getCell("tree-cell").attach(this.tree);
        layout.getCell("scheduler-cell").attach(scheduler);

        scheduler.config.first_hour = 9;
        scheduler.config.last_hour = 20;
        scheduler.config.container_autoresize = true;
        // scheduler.config.dblclick_create = true;
        scheduler.config.details_on_create = true;
		scheduler.config.details_on_dblclick = true;
        // scheduler._init_event('onExternalDragIn');

        scheduler.templates.event_header = function(start,end,ev){
            return ev.name
        };

        scheduler.templates.event_text=function(start, end, event){
            return "<p> Related Activity: "+event.activityName+"</p><hr><p> Client: "+event.client+"</p><hr><p> In-situ: "+event.insitu+"</p><hr><p> TPS: "+event.tps+"</p><hr>"
        }

        EventServices.getAllEvents().then( response => {
            for(const event of response.data) {
                event.text = event.name
                event.id = event._id
            }
            this.scheduler_data = response.data;
        })

        scheduler.attachEvent("onEventAdded", function(id,ev){
            var query = {
                projectId: ev.project_id,
                scheduleId: ev.schedule_id
            }
            ScheduleServices.getSchedule(query).then(response => {
                var schedule = response.data.schedules[0];
                ev.client = schedule.client;
                ev.tps = schedule.duration;
                ev.activityName = schedule.name;
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
            type:  "dhx_time_block"
        });

        scheduler.attachEvent("onEventChanged", function(id,ev){
            EventServices.updateEvent(id, ev)
        });

        scheduler.attachEvent("onDragEnd", function(id,ev){
            var event = scheduler.getEvent(id)
            EventServices.updateEvent(id, event)
        })
         
        
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

            var update_select_options = function(select, options) {
                select.options.length = 0;
                for (var i=0; i<options.length; i++) {
                    var option = options[i];
                    select[i] = new Option(option.label, option.key);
                }
            };

            var parent_onchange = (event) => {
                var new_child_options = this.schedule_select_options[event.srcElement.value];
                update_select_options(scheduler.formSection('Activity').control, new_child_options);
            };
        
            scheduler.attachEvent("onBeforeLightbox", (id) => {
                var ev = scheduler.getEvent(id);
                if (!ev.schedule_id) {
                    var project_id = this.project_select_options[0].key;
                    var new_child_options = this.schedule_select_options[project_id];
                    update_select_options(scheduler.formSection('Activity').control, new_child_options);
                }
                return true;
            });

            scheduler.config.lightbox.sections = [    
                {name:"Name", height:72, map_to:"name", type:"textarea" , focus:true},
                {name: "Project", height: 72, type:"select", options: this.project_select_options, map_to:"project_id", onchange:parent_onchange },
                {name:"Livrable/Lot", height: 72, map_to: "deliverable", type:"textarea"},
                {name:"Activity", height: 72, type:"select", options: this.schedule_select_options, map_to:"schedule_id"},
                {name:"In-Situ", height: 72, map_to: "insitu", type:"select",  options: [{key: true, label: "yes"} , {key:false, label: "no"}], vertical: false},
                {name:"time", height:72, type:"time", map_to:"auto"},
            ];
        },
        user: function() {
            for (const project of this.user.projects) {
                ProjectServices.getProject(project).then(response => {
                    var doc = {};
                    doc.items = [];
                    doc.value = response.data.name;
                    doc.id = response.data._id;
                    doc.opened = true;
                    for(const schedule of response.data.schedules) {
                        var data = {};
                        var item = {};
                        if(schedule.resources.indexOf(this.currentUser._id)) {
                            for( let i = 0 ; i < schedule.duration ; i++ ) {
                                data.text = schedule.name;
                                data.holder = schedule.resources[0].username;
                                data.description = schedule.comments;
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
                })
            }
        },
        events: function() {
            this.tree.data.parse(this.documents);
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
    @import "~dhx-suite/codebase/suite.min.css";

    body {
		margin: 0px;
		padding: 0px;
		height: 100%;
		overflow: hidden;
	}

    .week-end {
        background-color: #e8e8e87d;
    }

    #scheduler_container{ 
        height: 100vh;
        width: 66vw;
        margin-left: 33vw;
        background-color: white;
		border-left: 1px solid #EBE9E9;
		border-right: 1px solid #EBE9E9;
    }

    #tree_container{
        position: absolute;
        height: 100vh;
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