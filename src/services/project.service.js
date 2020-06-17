import http from "../http-common";

class projectServices {

    getAllProject() {
    return http.get("/projects");
    }

    getProject(id) {
        return http.get(`/projects/${id}`);
      }

    createProject(data) {
      return http.post("/projects", data);
     }
     
    createSchedule(data){
      return http.post("/projects/schedule", data)
    }

    updateProject(id, data) {
      return http.put(`/projects/${id}`, data);
    }

    updateSchedule(id, data) {
      return http.put(`/projects/schedule/${id}`, data)
    }

    deleteProject(id) {
      return http.delete(`/projects/${id}`);
    }

    deleteAllProject() {
      return http.delete(`/projects`);
    }

    findProjectByName(name) {
      return http.get(`/projects?name=${name}`);
    }
}

export default new projectServices();