<template>
<div ref="container" class="widget-box"></div>
</template>

 
<script>
import {Gantt} from 'dhtmlx-gantt';
import ProjectServices from '../services/project.service';
import ScheduleServices from '../services/schedule.service';
import LinkServices from '../services/link.service';
import moment from 'moment';
import Schedule from '../../models/schedule.init';
import Project from '../../models/project.init';
export default {
    mounted:function(){
        var formatDate = function(date, initFormat, exitFormat) {
            var data = moment(date, initFormat).format(exitFormat);
            return data
        }

        var router = this.$router;

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
        var colHeader = '<div class="gantt_grid_head_cell gantt_grid_head_add  " style="width:44px;" role="button" aria-label="New task" data-column-id="add" ></div>';

        gantt.config.columns = [
            {name: "text", label: textFilter, tree: true, width: '*', resize: true},
            {name: "start_date", align: "center", resize: true},
            {name: "duration", align: "center"},
            {name: "buttons",label: colHeader,width: 75,template: function (task) {
                if(task.parent == "0") {
                    return (
                        '<i class="fas fa-pencil-alt" data-action="edit"></i>' +
                        '<i class="fas fa-plus" data-action="add"></i>' +
                        '<i class="fas fa-times" data-action="delete"></i>'
                    );
                } else {
                    return (
                        '<i class="fas fa-plus" data-action="add"></i>' +
                        '<i class="fas fa-times" data-action="delete"></i>'
                    );
                }
            }}
        ];

        var filterValue = "";
        Gantt.$doFilter = function(value){
            filterValue = value;
            gantt.refreshData();
        }

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
				case "edit":
                    Gantt.$doFilter("");
					router.push({ path: `/project/${id}` })
					break;
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

        ProjectServices.getAllProject().then(response => {

            var tasks = {};
            tasks.data = [];
            tasks.links =  [];

            for(const project of response.data) {
                var dataset = {};
                var startDate = formatDate(project.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                var endDate = formatDate(project.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');

                dataset.id = project._id;
                dataset.progress = project.progress;
                dataset.type = project.type;
                dataset.parent = project.parent;
                dataset.text = project.projectName;
                dataset.start_date = startDate;
                dataset.end_date = endDate;
                
                for(const schedule of project.schedules) {
                    if(schedule) {
                    var scheduleStartDate = formatDate(schedule.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    var scheduleEndDate = formatDate(schedule.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                    schedule.id = schedule._id;
                    schedule.start_date = scheduleStartDate;
                    schedule.end_date = scheduleEndDate;
                    schedule.text = schedule.name;
                    tasks.data.push(schedule);
                    }
                }
                for(const link of project.links){
                    link.id = link._id;
                    delete link._id;
                    tasks.links.push(link);
                }
                tasks.data.push(dataset);
            }
            gantt.init(this.$refs.container);
            gantt.parse(tasks);
        });
        
        gantt.createDataProcessor({ 
            task: {
                create: function(data) {
                    console.log(data);
                    if(data.parent == '0'){
                        data.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data._id = data.id;
                        data.projectName = data.text;
                        data.status = "Not Started";
                        delete data.id;
                        delete data.text;
                        delete data["!nativeeditor_status"];
                        var initProjectData = new Project;
                        Object.assign(data, initProjectData);
                        ProjectServices.createProject(data).then(gantt.message({type:"success", text:"Project has been created successfully"}))
                    } else {
                            var nestedLevel = 0;
                            gantt.eachParent(function(task){
                                nestedLevel ++;
                                if(task.parent == '0') {
                                    var project = {};
                                    project.schedule = {};
                                    project._id = String(task.id);
                                    project.schedule = data;
                                    project.schedule.nestedLevel = nestedLevel;
                                    project.schedule.type = data.type;
                                    project.schedule._id = String(data.id);
                                    project.schedule.name = data.text;
                                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    delete project.schedule.id;
                                    delete project.schedule.text;
                                    delete project.schedule["!nativeeditor_status"];
                                    var initScheduleData = new Schedule;
                                    Object.assign(project.schedule, initScheduleData);
                                    ScheduleServices.createSchedule(project).then(gantt.message({type:"success", text:"Task has been created successfully"}))
                                }
                            }, data.id);
                    }
                },
                update: function(data, id) {
                    if(data.parent == '0'){
                        data.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.projectName = data.text;
                        delete data.text;
                        delete data["!nativeeditor_status"];
                        ProjectServices.updateProject(id,data).then(gantt.message({type:"success", text:"Project has been updated successfully"}))
                    } else {
                            gantt.eachParent(function(task){
                                if(task.parent == '0') {
                                    var project = {};
                                    console.log(data)
                                    project.schedule = {};
                                    project._id = String(task.id);
                                    project.schedule = data;
                                    project.schedule.type = data.type;
                                    project.schedule._id = String(data.id);
                                    project.schedule.name = data.text;
                                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    delete project.schedule.id;
                                    delete project.schedule.text;
                                    delete project.schedule["!nativeeditor_status"];
                                    var initScheduleData = new Schedule;
                                    Object.assign(project.schedule, initScheduleData);
                                    ScheduleServices.updateSchedule(project._id, project).then(gantt.message({type:"success", text:"Task has been updated successfully"}))
                                }
                            }, data.id);
                    }
                    
                },
                delete: function(id) {
                    console.log(id);
                }
            },
            link: {
                create: function(link) {
                     gantt.eachParent(function(task){
                        if(task.parent == '0') {
                        var project = {};
                        project._id = String(task.id);
                        project.link = link;
                        project.link._id = link.id;
                        delete project.link.id;
                        delete link["!nativeeditor_status"];
                        LinkServices.createLink(project).then(gantt.message({type:"success", text:"Link was created successfully"}))
                        }
                    }, link.source);
                    
                },
                update: function(link) {
                    gantt.eachParent(function(task){
                        if(task.parent == '0') {
                        var project = {};
                        project._id = String(task.id);
                        project.link = link;
                        project.link._id = link.id;
                        delete project.link.id;
                        delete link["!nativeeditor_status"];
                        LinkServices.updateLink(project._id, project).then(gantt.message({type:"success", text:"Link has been updated successfully"}))
                        }
                    }, link.source);
                },
                delete: function(id) {
                    console.log(id);
                }
            }
        });

        gantt.attachEvent("onBeforeTaskDelete", function(id, item){
            if(item.parent == '0') {
                ProjectServices.deleteProject(id)
            } else {
                gantt.eachParent(function(task){
                    if(task.parent == '0') {
                        var data = {};
                        data.projectId = String(task.id);
                        data.scheduleId = id;
                        ScheduleServices.deleteSchedule(data).then(gantt.message({type:"success", text:"Schedule has been deleted successfully"}))
                    }
                }, id)
            }
            return true;
        });

        gantt.attachEvent("onBeforeLinkDelete", function(id,item){
            gantt.eachParent(function(task){
                if(task.parent == '0') {
                    var data = {};
                    data.projectId = String(task.id);
                    data.linkId = String(id);
                    LinkServices.deleteLink(data).then(gantt.message({type:"success", text:"Link has been deleted successfully"}))
                }
            }, item.source)
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

.gantt-success div {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
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