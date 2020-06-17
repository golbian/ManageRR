import http from "../http-common";

class roleServices {
  getAllRole() {
    return http.get("/roles/find-all");
  }

  getRole(id) {
    return http.get(`/roles/${id}`);
  }

  createRole(data) {
    return http.post("/roles", data);
  }

  updateRole(id, data) {
    return http.put(`/roles/${id}`, data);
  }

  deleteRole(id) {
    return http.delete(`/roles/${id}`);
  }

  deleteAllRole() {
    return http.delete(`/roles`);
  }

  findRoleByName(name) {
    return http.get(`/projects?name=${name}`);
  }
}

export default new roleServices();