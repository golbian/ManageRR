import http from "../http-common";
import authHeader from './auth-header';

class roleServices {
  getAllRole() {
    return http.get("/roles",{ headers: authHeader()});
  }

  getRole(id) {
    return http.get(`/roles/${id}`, { headers: authHeader()});
  }

  createRole(data) {
    return http.post("/roles", data, { headers: authHeader()});
  }

  updateRole(id, data) {
    return http.put(`/roles/${id}`, data, { headers: authHeader()});
  }

  deleteRole(id) {
    return http.delete(`/roles/${id}`, { headers: authHeader()});
  }

  findRoleByName(name) {
    return http.get(`/roles?name=${name}`, { headers: authHeader()});
  }
}

export default new roleServices();