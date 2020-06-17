import http from "../http-common";

class gridServices {
  getAllGrid() {
    return http.get("/grids");
  }

  getGrid(id) {
    return http.get(`/grids/${id}`);
  }

  createGrid(data) {
    return http.post("/grids", data);
  }

  updateGrid(id, data) {
    return http.put(`/grids/${id}`, data);
  }

  deleteGrid(id) {
    return http.delete(`/grids/${id}`);
  }

  deleteAllGrid() {
    return http.delete(`/grids`);
  }

  findGridByName(name) {
    return http.get(`/grids?name=${name}`);
  }
}

export default new gridServices();
