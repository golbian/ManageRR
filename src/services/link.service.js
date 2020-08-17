import http from "../http-common";
import authHeader from './auth-header';

class linkServices {
     
    createLink(data){
      return http.post("/link", data, { headers: authHeader()})
    }

    updateLink(id, data) {
      return http.put(`/link/${id}`, data, { headers: authHeader()})
    }

    deleteLink(data) {
      return http.delete(`/link/${data.projectId}/${data.linkId}`, { headers: authHeader()});
    }
}

export default new linkServices();