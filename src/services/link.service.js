import http from "../http-common";

class linkServices {
     
    createLink(data){
      return http.post("/link", data)
    }

    updateLink(id, data) {
      return http.put(`/link/${id}`, data)
    }

    deleteLink(data) {
      return http.delete(`/link`, {data});
    }
}

export default new linkServices();