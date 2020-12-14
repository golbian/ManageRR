import http from "../http-common";
import authHeader from './auth-header';

class projectServices {

    getAllProject() {
      return http.get(`/projects`,{ headers: authHeader() });
    }

    getAllPublishedProject() {
      return http.get("/projects/published",{ headers: authHeader() });
    }

    getAllOwnerProject(user) {
      return http.get(`/projects/user/${user}`,{ headers: authHeader() });
    }

    async getProject(id) {
        return http.get(`/projects/${id}`,{ headers: authHeader() });
      }

    create(data) {
      return http.post("/projects", data, { headers: authHeader()});
     }

    attachProjectManager(id, data) {
      return http.put(`/projects/pm/${id}`, data, {headers: authHeader()});
    }

    update(id, data) {
      return http.put(`/projects/${id}`, data, { headers: authHeader()});
    }

    delete(id) {
      return http.delete(`/projects/${id}`,{ headers: authHeader() });
    }

    deleteAllProject() {
      return http.delete(`/projects`,{ headers: authHeader() });
    }
}

export default new projectServices();