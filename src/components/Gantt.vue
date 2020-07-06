<template>
<div ref="container" class="widget-box"></div>
</template>

 
<script>
import {gantt} from 'dhtmlx-gantt';
import ProjectServices from '../services/project.service';
import ScheduleServices from '../services/schedule.service';
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

        var colHeader = '<div class="gantt_grid_head_cell gantt_grid_head_add" onclick="gantt.createTask()"></div>';

        var filterValue = "";
	var delay;
	gantt.$doFilter = function(value){
		filterValue = value;
		clearTimeout(delay);
		delay = setTimeout(function(){
			gantt.render();
			gantt.$root.querySelector("[data-text-filter]").focus();
		}, 200)	
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
  var textFilter = "<input data-text-filter placeholder='Task Name' class='form-control' type='text' oninput='gantt.$doFilter(this.value)'>"

    gantt.config.columns = [
        {name: "text", label: textFilter, tree: true, width: '*', resize: true},
		{name: "start_date", align: "center", resize: true},
		{name: "duration", align: "center"},
		{name: "buttons",label: colHeader,width: 75,template: function () {
			return (
                '<i class="fas fa-pencil-alt" data-action="edit"></i>' +
				'<i class="fas fa-plus" data-action="add"></i>' +
				'<i class="fas fa-times" data-action="delete"></i>'
				);
		}}
	];

	gantt.attachEvent("onTaskClick", function(id, e){
		var button = e.target.closest("[data-action]")
		if(button){
			var action = button.getAttribute("data-action");
			switch (action) {
				case "edit":
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
                for(const link of project.link){
                    tasks.links.push(link);
                }
                tasks.data.push(dataset);
            }

            gantt.init(this.$refs.container);
            gantt.clearAll();
            gantt.parse(tasks);
        });

        gantt.createDataProcessor({ 
            task: {
                create: function(data) {
                    if(data.parent == '0'){
                        data.type = "Project";
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
                        ProjectServices.createProject(data)
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
                                    project.schedule.type = "Activity";
                                    project.schedule._id = String(data.id);
                                    project.schedule.name = data.text;
                                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    delete project.schedule.id;
                                    delete project.schedule.text;
                                    delete project.schedule["!nativeeditor_status"];
                                    var initScheduleData = new Schedule;
                                    Object.assign(project.schedule, initScheduleData);
                                    console.log(project)
                                    ScheduleServices.createSchedule(project);
                                }
                            }, data.id);
                    }
                },
                update: function(data, id) {
                    if(data.parent == '0'){
                        data.type = "Project";
                        data.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.projectName = data.text;
                        delete data.text;
                        delete data["!nativeeditor_status"];
                        ProjectServices.updateProject(id,data)
                    } else {
                            gantt.eachParent(function(task){
                                if(task.parent == '0') {
                                    var project = {};
                                    project.schedule = {};
                                    project._id = String(task.id);
                                    project.schedule = data;
                                    project.schedule.type = "Activity";
                                    project.schedule._id = String(data.id);
                                    project.schedule.name = data.text;
                                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    delete project.schedule.id;
                                    delete project.schedule.text;
                                    delete project.schedule["!nativeeditor_status"];
                                    var initScheduleData = new Schedule;
                                    Object.assign(project.schedule, initScheduleData);
                                    ScheduleServices.updateSchedule(project._id, project);
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
                    let data = {};
                    data.link = link;
                    ProjectServices.updateProject(link.source,data)
                    ProjectServices.updateProject(link.target,data)
                },
                update: function(link) {
                    let data = {};
                    data.link = link;
                    ProjectServices.updateProject(link.source,data)
                    ProjectServices.updateProject(link.target,data)
                },
                delete: function(id) {
                    console.log(id)
                }
            }
        });

        gantt.attachEvent("onBeforeTaskDelete", function(id, item){
            console.log(item);
            if(item.parent == '0') {
                ProjectServices.deleteProject(id)
            } else {
                gantt.eachParent(function(task){
                    if(task.parent == '0') {
                        var data = {};
                        data.projectId = String(task.id);
                        data.scheduleId = id;
                        console.log(data)
                        ScheduleServices.deleteSchedule(data)
                    }
                }, id)
            }
            return true;
        });
    }
}
</script>
 
<style>
    @import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
    @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.0-2/css/all.min.css";

html, body{
  margin:0;
  padding:0;
  
}

#gantt_here{
  width: 100vw;  
  height: 100vh;
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