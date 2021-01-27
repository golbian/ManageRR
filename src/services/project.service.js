import http from "../http-common";
import authHeader from './auth-header';

class projectServices {

    getAllProject(filters) {
      const query = new URLSearchParams({
        search: filters.search,
        sort_value: filters.sort.value,
        sort_type: filters.sort.type,
      }).toString();

        return http.get(`/projects?`+ query , { headers: authHeader() });
    }

    getAllPublishedProject() {
      return http.get("/projects/published",{ headers: authHeader() });
    }

    getAllPmProject(pm) {
      return http.get(`/projects/pm/${pm}`,{ headers: authHeader() });
    }

    getAllKamProject(kam) {
      return http.get(`/projects/kam/${kam}`,{ headers: authHeader() });
    }

    findAllRessourceProject(resource) {
      return http.get(`/projects/resource/${resource}`,{ headers: authHeader() });
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