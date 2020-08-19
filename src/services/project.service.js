import http from "../http-common";
import authHeader from './auth-header';

class projectServices {

    getAllProject() {
      return http.get("/projects",{ headers: authHeader() });
    }

    getAllPublishedProject() {
      return http.get("/projects/published",{ headers: authHeader() });
    }

    getAllOwnerProject(id) {
      return http.get(`/projects/pm/${id}`,{ headers: authHeader() });
    }

    async getProject(id) {
        return http.get(`/projects/${id}`,{ headers: authHeader() });
      }

    createProject(data) {
      return http.post("/projects", data, { headers: authHeader()});
     }

    attachProjectManager(id, data) {
      return http.put(`/projects/pm/${id}`, data, {headers: authHeader()});
    }

    updateProject(id, data) {
      return http.put(`/projects/${id}`, data, { headers: authHeader()});
    }

    deleteProject(id) {
      return http.delete(`/projects/${id}`,{ headers: authHeader() });
    }

    deleteAllProject() {
      return http.delete(`/projects`,{ headers: authHeader() });
    }
}

export default new projectServices();