<template>
<div ref="container" class="widget-box"></div>
</template>

 
<script>
import {Gantt} from 'dhtmlx-gantt';
import ProjectServices from '../services/project.service';
import ScheduleServices from '../services/schedule.service';
import LinkServices from '../services/link.service';
import UserServices from '../services/user.service';
import moment from 'moment';
import Schedule from '../../models/schedule.init';
import Project from '../../models/project.init';
export default {
    data() {
        return {
            roles: [],
            resources: [],
            tasks: {
                data: [],
                links: [],
            },
        };
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        }
    },
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
                readonly : true
            },
        });

        UserServices.getUser(this.currentUser.id).then(res => {
            for(const role of res.data.roles) {
                this.roles.push(role);
                if(role.readOnly === false) {
                    gantt.config.readonly = false;
                }
            }
        }).catch(err => {
            console.log(err)
        })

        var resourcesInit = function(users) {
            gantt.templates.grid_row_class = function(start, end, task){
                var css = [];
                if(gantt.hasChild(task.id)){
                    css.push("folder_row");
                }

                if(task.$virtual){
                    css.push("group_row")
                }

                return css.join(" ");
            };

            gantt.templates.task_row_class = function(start, end, task){
                start, end, task;
                return "";
            };

            gantt.templates.timeline_cell_class = function (task, date) {
                if (!gantt.isWorkTime({date: date, task: task}))
                    return "week_end";
                return "";
            };

            gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
                var css = [];
                css.push("resource_marker");
                if (tasks.length <= 1) {
                    css.push("workday_ok");
                } else {
                    css.push("workday_over");
                }
                return css.join(" ");
            };

            gantt.templates.resource_cell_value = function(start_date, end_date, resource, tasks){
                var result = 0;
                tasks.forEach(function(item) {
                    var assignments = gantt.getResourceAssignments(resource.id, item.id);
                    assignments.forEach(function(assignment){
                        assignment.value = resource.value;
                        var task = gantt.getTask(assignment.task_id);
                        if(resource.type == "work"){
                            result += assignment.value * 1;
                        }else{
                            result += assignment.value / (task.duration || 1);
                        }
                    });
                });

                if(result % 1){
                    result = Math.round(result * 10)/10;
                }
                return "<div>" + result + "</div>";
            };



            var resourceTemplates = {
                grid_row_class: function(start, end, resource){
                    var css = [];
                    if(gantt.$resourcesStore.hasChild(resource.id)){
                        css.push("folder_row");
                        css.push("group_row");
                    }

                    return css.join(" ");
                },
                task_row_class: function(start, end, resource){
                    var css = [];

                    if(gantt.$resourcesStore.hasChild(resource.id)){
                        css.push("group_row");
                    }

                    return css.join(" ");

                }
            };

            gantt.locale.labels.section_resources = "Resources";
            gantt.config.lightbox.project_sections = [
                {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
                {name: "resources", type: "select", map_to: "resources", options: gantt.serverList("people")},
                {name: "time", type: "duration", map_to: "auto"}
            ];

            var resourceConfig = {
                scale_height: 30,
                scales: [
                    {unit: "day", step: 1, date: "%d %M"}
                ],
                columns: [
                    {
                        name: "name", label: "Name", tree:true, width:250, template: function (resource) {
                            return resource.text;
                        }, resize: true
                    },
                    {
                        name: "allocated", label: "Allocated", align:"left", width:100, template: function (resource) {
                            var assignments = gantt.getResourceAssignments(resource.id);
                            var result = 0;
                            assignments.forEach(function(assignment){
                                assignment.value = resource.value;
                                var task = gantt.getTask(assignment.task_id);
                                if(resource.type == "work"){
                                    result += task.duration * assignment.value;
                                }else{
                                    result += assignment.value * 1;
                                }
                            });

                            if(resource.type == "work"){
                                result = "<b>" +result +  "</b> hours";
                            }else{
                                result = "<b>" +result + "</b> " + resource.unit;
                            }

                            return result;
                        }, resize: true
                    }
                ]
            };

            gantt.config.scales = [
                {unit: "month", step: 1, format: "%F, %Y"},
                {unit: "day", step: 1, format: "%d %M"}
            ];
            gantt.config.reorder_grid_columns = true;
            gantt.config.auto_scheduling = true;
            gantt.config.auto_scheduling_strict = true;
            gantt.config.work_time = true;
            gantt.config.resource_store = "resource";
            gantt.config.resource_property = "resources";
            gantt.config.order_branch = true;
            gantt.config.open_tree_initially = true;
            gantt.config.scale_height = 50;
            gantt.config.layout = {
                css: "gantt_container",
                rows: [
                    {
                        gravity: 2,
                        cols: [
                            {view: "grid", group:"grids", scrollY: "scrollVer"},
                            {resizer: true, width: 1},
                            {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                            {view: "scrollbar", id: "scrollVer", group:"vertical"}
                        ]
                    },
                    { resizer: true, width: 1, next: "resources"},
                    {
                        height: 35,
                        cols: [
                            { html:"", group:"grids"},
                            { resizer: true, width: 1},
                            { html:""}
                        ]
                    },

                    {
                        gravity:1,
                        id: "resources",
                        config: resourceConfig,
                        templates: resourceTemplates,
                        cols: [
                            { view: "resourceGrid", group:"grids", scrollY: "resourceVScroll" },
                            { resizer: true, width: 1},
                            { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll"},
                            { view: "scrollbar", id: "resourceVScroll", group:"vertical"}
                        ]
                    },
                    {view: "scrollbar", id: "scrollHor"}
                ]
            };

            gantt.$resourcesStore = gantt.createDatastore({
                name: gantt.config.resource_store,
                type: "treeDatastore",
                initItem: function (item) {
                    item.parent = item.parent || gantt.config.root_id;
                    item[gantt.config.resource_property] = item.parent;
                    item.open = true;
                    return item;
                }
            });


            gantt.$resourcesStore.attachEvent("onFilterItem", function(id, item) {
                item;
                return gantt.getResourceAssignments(id).length > 0;
            });
            gantt.$resourcesStore.attachEvent("onParse", function(){
                var people = [];
                gantt.$resourcesStore.eachItem(function(res){
                    if(!gantt.$resourcesStore.hasChild(res.id)){
                        var copy = gantt.copy(res);
                        copy.key = res.id;
                        copy.label = res.text;
                        people.push(copy);
                    }
                });
                gantt.updateCollection("people", people);
            });
            gantt.attachEvent("onParse", function(){
                gantt.render();
            });

            gantt.$resourcesStore.parse(users);
        }
	
    UserServices.getAllUser().then(res => {
        for(const user of res.data) {
            var data = {};
            data.id = user._id;
            data.text = user.username;
            data.unit = "hours/day";
            data.value = user.value;
            data.type = "work";
            this.resources.push(data);
        }
        resourcesInit(this.resources);
    });

        var textFilter = "<input data-text-filter placeholder='Task Name' class='form-control' type='text' oninput='Gantt.$doFilter(this.value)'>"
        var colHeader = '<div class="gantt_grid_head_add" style="border-left: 1px solid #cecece !important;" role="button" aria-label="New task" data-column-id="add" ></div>';

        gantt.config.columns = [
                {name: "text", label: textFilter, tree: true, width: 120, resize: true},
                {name: "start_date", align: "center", resize: true},
                {name: "resources", align: "center", width: 80, label: "Resources", resize: true,
                    template: function (task) {
                        // if (task.type == gantt.config.types.project) {
                        //     return "";
                        // }

                        var result = "";
                        var store = gantt.getDatastore("resource");
                        var assignments = task[gantt.config.resource_property];

                        if (!assignments || !assignments.length) {
                            return "";
                        }

                        // if(assignments.length == 1){
                        // 	return store.getItem(assignments[0].resource_id).text.split(",")[0];
                        // }

                        assignments.forEach(function(assignment) {
                            var resource = store.getItem(assignment.resource_id);
                            if (!resource)
                                return;
                            result += "<div class='owner-label' title='" + resource.text + "'>" + resource.text.substr(0, 1) + "</div>";
                        });
                        return result;
                    }
                },
                {name: "duration", width: 80, align: "center", resize: true},
                {name: "charge", width: 80, align: "center", resize: true, label: "Charge",
                    template: function(task) {
                        
                        if (task.type == gantt.config.types.project) {
                            console.log(task.charge)
                            // return "";
                        }
                        var result = "";
                            result += "<div class='charge-label' title='" + task.charge + "'>" + task.charge + "</div>";
                            return result;
                    }
                },
                {name: "buttons",label: colHeader,width: 80,template: function (task) {
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
            gantt.$root.querySelector("[data-text-filter]").focus();
        }

        gantt.config.lightbox.sections = [
            {name: "description", height: 70, map_to: "text", type: "textarea"},
            {name: "type", type: "typeselect", map_to: "type"},
            {name: "resources", type: "resources", map_to: "resources", options: gantt.serverList("people")},
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
                    // Gantt.$doFilter("");
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

            for(const project of response.data) {
                var dataset = {};
                var startDate = formatDate(project.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                var endDate = formatDate(project.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');

                dataset.id = project._id;
                dataset.progress = project.progress;
                dataset.type = project.type;
                dataset.parent = project.parent;
                dataset.text = project.name;
                dataset.charge = project.charge;
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
                    this.tasks.data.push(schedule);
                    }
                }
                for(const link of project.links){
                    link.id = link._id;
                    delete link._id;
                    this.tasks.links.push(link);
                }
                this.tasks.data.push(dataset);
            }
            gantt.init(this.$refs.container);
            gantt.parse(this.tasks);
        }).catch(err => {
            if(err) {

                ProjectServices.getAllOwnerProject(this.currentUser.id).then(response => {

                    for(const project of response.data) {
                        var dataset = {};
                        var startDate = formatDate(project.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        var endDate = formatDate(project.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');

                        dataset.id = project._id;
                        dataset.progress = project.progress;
                        dataset.type = project.type;
                        dataset.parent = project.parent;
                        dataset.text = project.name;
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
                            this.tasks.data.push(schedule);
                            }
                        }
                        for(const link of project.links){
                            link.id = link._id;
                            delete link._id;
                            this.tasks.links.push(link);
                        }
                        this.tasks.data.push(dataset);
                    }
                    gantt.init(this.$refs.container);
                    gantt.parse(this.tasks);
                });

                ProjectServices.getAllPublishedProject().then(response => {

                    for(const project of response.data) {
                        var dataset = {};
                        var startDate = formatDate(project.start_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');
                        var endDate = formatDate(project.end_date, 'YYYY-MM-DD[T00:00:00.000Z]', 'DD-MM-YYYY');

                        dataset.id = project._id;
                        dataset.progress = project.progress;
                        dataset.type = project.type;
                        dataset.parent = project.parent;
                        dataset.text = project.name;
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
                            this.tasks.data.push(schedule);
                            }
                        }
                        for(const link of project.links){
                            link.id = link._id;
                            delete link._id;
                            this.tasks.links.push(link);
                        }
                        this.tasks.data.push(dataset);
                    }
                    gantt.init(this.$refs.container);
                    gantt.parse(this.tasks);
                })
            }
        });
        
        gantt.createDataProcessor({ 
            task: {
                create: function(data) {
                    if(data.parent == '0'){
                        data.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data._id = data.id;
                        data.name = data.text;
                        data.type = "project";
                        data.published = false;
                        data.status = "Not Started";
                        delete data.id;
                        delete data.text;
                        delete data["!nativeeditor_status"];
                        var initProjectData = new Project;
                        Object.assign(data, initProjectData);
                        ProjectServices.createProject(data).then(success => {
                            if(success) {
                                gantt.message({type:"success", text:"Project has been created successfully"})
                            }
                        }).catch(err => {
                            if(err) {
                                gantt.message({type:"error", text:"Something went wrong"})
                            }
                        })
                    } else {
                            var nestedLevel = 0;
                            gantt.eachParent(function(task){
                                nestedLevel ++;
                                if(task.parent == '0') {
                                    var project = {};
                                    var resourceTab = [];
                                    project.schedule = {};
                                    project._id = String(task.id);
                                    project.schedule = data;
                                    project.schedule.nestedLevel = nestedLevel;
                                    project.schedule.type = data.type;
                                    project.schedule._id = String(data.id);
                                    project.schedule.name = data.text;
                                    project.schedule.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    project.schedule.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                                    for(var resource of project.schedule.resources) {
                                        resourceTab.push(resource.resource_id)
                                    }
                                    project.schedule.resources = resourceTab;
                                    delete project.schedule.id;
                                    delete project.schedule.text;
                                    delete project.schedule["!nativeeditor_status"];
                                    var initScheduleData = new Schedule;
                                    Object.assign(project.schedule, initScheduleData);
                                    ScheduleServices.createSchedule(project).then(success => {
                                    if(success) {
                                        gantt.message({type:"success", text:"Task has been created successfully"})
                                    }   
                                }).catch(err => {
                                    if(err) {
                                        gantt.message({type:"error", text:"Something went wrong"})
                                    }
                                })
                                }
                            }, data.id);
                    }
                },
                update: function(data, id) {
                    if(data.parent == '0'){
                        data.start_date = formatDate(data.start_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.end_date = formatDate(data.end_date, 'DD-MM-YYYY', 'YYYY-MM-DD[T00:00:00.000Z]');
                        data.projectName = data.text;
                        data.pm = data.resources;
                        console.log(data)
                        delete data.text;
                        delete data["!nativeeditor_status"];
                        ProjectServices.updateProject(id,data).then(success => {
                            if(success) {
                                gantt.message({type:"success", text:"Project has been updated successfully"})
                            }
                        }).catch(err => {
                            if(err) {
                                gantt.message({type:"error", text:"Something went wrong"})
                            }
                        })
                    } else {
                        gantt.eachParent(function(task){
                            if(task.parent == '0') {
                                var project = {};
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
                                for(const resource of project.schedule.resources) {
                                    resource._id = resource.resource_id;
                                }
                                ScheduleServices.updateSchedule(project._id, project).then(success => {
                                    if(success) {
                                        gantt.message({type:"success", text:"Task has been updated successfully"})
                                    }
                                }).catch(err => {
                                    if(err) {
                                        gantt.message({type:"error", text:"Something went wrong"})
                                    }
                                })
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
                        LinkServices.createLink(project).then(success => {
                            if(success) {
                                gantt.message({type:"success", text:"Link was created successfully"})
                            }
                        }).catch(err => {
                            if(err) {
                                gantt.message({type:"error", text:"Something went wrong"})
                            }
                        })
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
                        LinkServices.updateLink(project._id, project).then(success => {
                            if(success) {
                                gantt.message({type:"success", text:"Link has been updated successfully"})
                            }
                        }).catch(err => {
                            if(err) {
                                gantt.message({type:"error", text:"Something went wrong"})
                            }
                        })
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
                ProjectServices.deleteProject(id).then(gantt.message({type:"success", text:"Project has been deleted successfully"}))
                UserServices.deleteProject(id).then(gantt.message({type:"success", text:"Project has been deleted successfully from Users"}))
            } else {
                gantt.eachParent(function(task){
                    if(task.parent == '0') {
                        var data = {};
                        data.projectId = String(task.id);
                        data.scheduleId = id;
                        var childrens = gantt.getChildren(id);
                        for(const child of childrens) {
                            var req = {
                                projectId: task.id,
                                scheduleId: child
                            }
                            ScheduleServices.deleteSchedule(req).then(success => {
                                if(success) {
                                    gantt.message({type:"success", text:"Cascading elements has been deleted"})
                                }
                            }).catch(err => {
                                if(err) {
                                    gantt.message({type:"error", text:"Something went wrong"})
                                }
                            })
                        }
                        ScheduleServices.deleteSchedule(data).then(success => {
                            if(success) {
                                gantt.message({type:"success", text:"Schedule has been deleted successfully"})
                            }
                        }).catch(err => {
                            if(err) {
                                gantt.message({type:"error", text:"Something went wrong"})
                            }
                        })
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
            console.log(to, from);
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

.gantt_grid_head_text .form-control {
    border: 1px solid #ced4da;
    display: inline;
    font-size: 12px;
    height: 100%;
    font-weight: bold;
    color: rgba(0, 0, 0, 1);
}

div.gantt_cal_ltext label input[type=radio] {
    margin-left: 10px;
}

.widget-box {
	width:100%;
	height: 800px;
	height:100vh;
}

.gantt_grid_scale .gantt_grid_head_cell,
.gantt_task .gantt_task_scale .gantt_scale_cell {
	font-weight: bold;
	font-size: 14px;
	color: rgba(0, 0, 0, 0.7);
}

.resource_marker{
	text-align: center;
}
.resource_marker div{
	width: 28px;
	height: 28px;
	line-height: 29px;
	display: inline-block;

	color: #FFF;
	margin: 3px;
}
.resource_marker.workday_ok div {
	border-radius: 15px;
	background: #51c185;
}

.resource_marker.workday_over div{
	border-radius: 3px;
	background: #ff8686;
}

.folder_row {
	font-weight: bold;
}

.gantt_task_cell.week_end {
	background-color: #e8e8e87d;
}

.gantt_task_row.gantt_selected .gantt_task_cell.week_end {
	background-color: #e8e8e87d !important;
}


.group_row,
.group_row.odd,
.gantt_task_row.group_row{
	background-color: rgba(232, 232, 232, 0.6);
}

.owner-label{
	width: 20px;
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	display: inline-block;
	border: 1px solid #cccccc;
	border-radius: 25px;
	background: #e6e6e6;
	color: #6f6f6f;
	margin: 0 3px;
	font-weight: bold;
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

.gantt_grid_head_add:hover {
    opacity: 1;
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