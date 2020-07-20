<template>
<div ref="container" class="widget-box">
    <div id="gantt_container"></div>
    <div id="grid_container"></div>
</div>
</template>
<script>
import {Gantt} from 'dhtmlx-gantt';
import { Grid as GridDHX} from "dhx-grid";
import "dhx-grid/codebase/grid.min.css";
import moment from 'moment';
import ProjectServices from '../services/project.service';
import ScheduleServices from '../services/schedule.service';
import LinkServices from '../services/link.service';
import Schedule from '../../models/schedule.init';

export default {
    data() {
        return {
            grid: {
                id: null,
                name: null,
            },
            gridData: [],
        };
    },
    created(){
        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var projectId = this.$route.params.id;

        ProjectServices.getProject(projectId).then(response => {

            this.gridData = response.data.schedules;
            
            for(const schedule of this.gridData) {
                var startDate = formatDate(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                var endDate = formatDate(schedule.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');    
                schedule.id = schedule._id;
                schedule.start_date = startDate;
                schedule.end_date = endDate;
                schedule.jours = schedule.duration;
                // schedule.name = schedule.name;
            }

            this.grid.data.parse(this.gridData);
        });
    },
    mounted:function(){
        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }
        
        var tasks = {};
        tasks.data = [];
        tasks.links = [];
        var projectId = this.$route.params.id;

        var colHeader = '<div class="gantt_grid_head_add" style="width:74px;border-left: 1px solid #cecece !important;" role="button" aria-label="New task" data-column-id="add" ></div>';

        var filterValue = "";

    const gantt = Gantt.getGanttInstance({
            plugins:{
                click_drag: true,
                // auto_scheduling: true,
                critical_path: true,
                drag_timeline: true,
                grouping: true
            },
            config: {
                work_time: true,
                // auto_scheduling_compatibility: true,
                // auto_scheduling: true,
                // auto_scheduling_strict: true,
                // auto_scheduling_initial: true,
                highlight_critical_path: true,
            },
        });

        var textFilter = "<input data-text-filter placeholder='Task Name' class='form-control' type='text' oninput='Gantt.$doFilter(this.value)'>"

        gantt.config.columns = [
            {name: "text", label: textFilter, tree: true, width: '*', resize: true},
            {name: "start_date", align: "center", resize: true},
            {name: "duration", align: "center"},
            {name: "buttons",label: colHeader,width: 75,template: function () {
                return (
                    '<i class="fas fa-plus" data-action="add"></i>' +
                    '<i class="fas fa-times" data-action="delete"></i>'
                );
            }}
        ];

        gantt.config.lightbox.sections = [
            {name: "description", height: 70, map_to: "text", type: "textarea"},
            {name: "type", type: "typeselect", map_to: "type"},
            {name: "time", height: 72, type: "duration", map_to: "auto"}
        ];
        
        gantt.templates.rightside_text = function(start, end, task){
            if(task.type == gantt.config.types.milestone){
                return task.text;
            }
        return "";
    };
        
        Gantt.$doFilter = function(value){
            filterValue = value;
            gantt.refreshData();
        }

	gantt.attachEvent("onBeforeTaskDisplay", function(id, task){
    if(!filterValue) return true;

		var normalizedText = task.text.toLowerCase();
		var normalizedValue = filterValue.toLowerCase();
		return normalizedText.indexOf(normalizedValue) > -1;
	});
	
    gantt.attachEvent("onGanttRender", function(){
		gantt.$root.querySelector("[data-text-filter]").value = filterValue;
	})

	gantt.attachEvent("onTaskClick", function(id, e){
		var button = e.target.closest("[data-action]")
		if(button){
			var action = button.getAttribute("data-action");
			switch (action) {
                case "add":
					gantt.createTask(null, id);
					break;
				case "delete":
					gantt.confirm({
						title: gantt.locale.labels.confirm_deleting_title,
						text: gantt.locale.labels.confirm_deleting,
						callback: function (res) {
							if (res)
								gantt.deleteTask(id);
						}
					});
					break;
			}
			return false;

		}
		return true;
	});

        ProjectServices.getProject(projectId).then(response => {
            for(const schedule of response.data.schedules) {
                if(schedule.nestedLevel == 1) {
                    schedule.parent = 0;
                }
                var data = {};
                var startDate = formatDate(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                var endDate = formatDate(schedule.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                data.id = schedule._id;
                data.start_date = startDate;
                data.end_date = endDate;
                data.text = schedule.name;
                data.parent = schedule.parent;
                tasks.data.push(data)
            }

            for(const link of response.data.links) {
                link.id = link._id;
                delete link._id;
                tasks.links.push(link);
            }

            gantt.init("gantt_container")
            gantt.clearAll();
            gantt.parse(tasks);

            /////////// Grid Code //////////////////////////

            var config = {
                columns: [
                    { width: 100, id: 'name',header: [{ text: "Designation" },{ content: "inputFilter" }] },
                    { width: 100, id: 'country',header: [{ text: "Country" },{ content: "inputFilter" }] },
                    { width: 100, id: 'client',header: [{ text: "Client" },{ content: "inputFilter" }] },
                    { width: 100, id: 'kam',header: [{ text: "KAM" },{ content: "inputFilter" }] },
                    { width: 100, id: 'pm',header: [{ text: "PM" },{ content: "inputFilter" }] },
                    { 
                        width: 160, id: 'stage', 
                        header: [{ text: "Stage" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Opportunity", "RFQ/RFI", "BID", "Final Negociation", "Lost", "Abandoned", "Commandes", "Livrée", "Facture", "Suspended"] 
                    },
                    { 
                        width: 160, id: 'temp', 
                        header: [{ text: "Température" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Froid", "Moyen", "Chaud"] 
                    },
                    { 
                        width: 160, id: 'domaine', 
                        header: [{ text: "Domaine" }, { content: "selectFilter" }], 
                        editorType: "select", 
                        options: ["Training", "Product & System", "In-Service", "Improvaero"] 
                    },
                    { width: 100, id: 'charge',header: [{ text: "Charge" },{ content: "inputFilter" }] },
                    { width: 100, id: 'ca',header: [{ text: "CA" },{ content: "inputFilter" }] },
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
                ],
                data: this.gridData,
                selection: "cell",
                editable: true,
                autoWidth: true,
                keyNavigation: true
            };

            this.grid = new GridDHX("grid_container", config);

            this.grid.selection.setCell(this.grid.data.getItem(this.grid.data.getId(0)), this.grid.config.columns[0]);
        
            this.grid.events.on('Change', function(id, status, data){
                var startDate = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                var endDate = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                var project = {}
                project._id = projectId;
                project.schedule = {};
                project.schedule._id = id;
                project.schedule.start_date = startDate;
                project.schedule.end_date = endDate;
                project.schedule.duration = data.jours;
                project.schedule.name = data.name;
                project.schedule.type = data.type;
                project.schedule.client = data.client;
                project.schedule.temp = data.temp;
                project.schedule.kam = data.kam;
                project.schedule.pm = data.pm;
                project.schedule.etp = data.etp;
                project.schedule.country = data.country;
                project.schedule.stage = data.stage;
                project.schedule.comments = data.comments;
                project.schedule.ressource = data.ressource;
                project.schedule.status = data.status;
                project.schedule.start_date = startDate;
                project.schedule.end_date = endDate;
                project.schedule.charge = data.charge;
                project.schedule.domaine = data.domaine;
                project.schedule.ca = data.ca;
                if(data.parent == "0") {
                    project.schedule.parent = projectId;
                } else {
                    project.schedule.parent = data.parent;
                }
                
                if(status === 'update') {
                    ScheduleServices.updateSchedule(project._id, project)
                } else if(status === "add") {
                    ScheduleServices.createSchedule(project)
                }
            });
        })

        
        gantt.createDataProcessor({ 
            task: {
                create: function(data) {
                    console.log(data);
                    var project = {};
                    project.schedule = {};
                    project._id = projectId;
                    project.schedule = data;
                    if(project.schedule.parent == "0") {
                        project.schedule.parent = projectId;
                        project.schedule.nestedLevel = 1;
                    }
                    project.schedule._id = String(data.id);
                    project.schedule.name = data.text;
                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                    delete project.schedule.id;
                    delete project.schedule.text;
                    delete project.schedule["!nativeeditor_status"];
                    var initScheduleData = new Schedule;
                    Object.assign(project.schedule, initScheduleData);
                    ScheduleServices.createSchedule(project).then(gantt.message({type:"success", text:"Schedule was created successfully"}));
                },
                update: function(data, id) {
                    var project = {};
                    project.schedule = {};
                    project._id = projectId;
                    project.schedule = data;
                    if(project.schedule.parent == "0") {
                        project.schedule.parent = projectId;
                    }
                    project.schedule._id = String(id);
                    project.schedule.name = data.text;
                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                    delete project.schedule.id;
                    delete project.schedule.text;
                    delete project.schedule["!nativeeditor_status"];
                    var initScheduleData = new Schedule;
                    Object.assign(project.schedule, initScheduleData);
                    ScheduleServices.updateSchedule(project._id, project).then(gantt.message({type:"success", text:"Schedule has been updated successfully"}));
                },
                delete: function(id) {
                    console.log(id);
                }
            },
            link: {
                create: function(link) {
                        var project = {};
                        project._id = projectId;
                        project.link = link;
                        project.link._id = link.id;
                        delete project.link.id;
                        delete link["!nativeeditor_status"];
                        LinkServices.createLink(project).then(gantt.message({type:"success", text:"Link was created successfully"}));
                },
                update: function(link) {
                        var project = {};
                        project._id = projectId;
                        project.link = link;
                        project.link._id = link.id;
                        delete project.link.id;
                        delete link["!nativeeditor_status"];
                        LinkServices.updateLink(project._id, project).then(gantt.message({type:"success", text:"Link has been updated successfully"}));
                },
                delete: function(id) {
                    console.log(id)
                }
            }
        });

        gantt.attachEvent("onBeforeTaskDelete", function(id){
                        var data = {};
                        data.projectId = projectId;
                        data.scheduleId = id;
                        var childrens = gantt.getChildren(id);
                        for(const child of childrens) {
                            var req = {
                                projectId: projectId,
                                scheduleId: child
                            }
                            ScheduleServices.deleteSchedule(req).then(gantt.message({type:"success", text:"Schedule has been deleted successfully"}));
                        }
                        ScheduleServices.deleteSchedule(data).then(gantt.message({type:"success", text:"Schedule has been deleted successfully"}));
        });
        gantt.attachEvent("onBeforeLinkDelete", function(id){
                    var data = {};
                    data.projectId = projectId;
                    data.linkId = String(id);
                    LinkServices.deleteLink(data).then(gantt.message({type:"success", text:"Link has been deleted successfully"}))
            return true;
        });
    },
    watch:{
        '$route' (to, from){
            console.log(to, from)
            var gantt = Gantt.getGanttInstance();
            gantt.destructor();
        }
    },
}

</script>
<style>
    @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
    @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.0-2/css/all.min.css";

html, body{
  margin:0;
  padding:0;
  
}

#gantt_container{ 
  height: 50vh;
}

#grid_container{ 
  height: 44vh;
}

.gantt-success div {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
}

.gantt_grid_head_add:hover {
    opacity: 1;
}

.fas {
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  opacity: 0.5;
  padding: 5px;
}

.fas:hover {
  opacity: 1;
}

.fa-pencil-alt {
  color: #ffa011;
}

.fa-plus {
  color: #328EA0;
}

.fa-times {
  color: red;
}
</style>