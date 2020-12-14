import http from "../http-common";
import authHeader from './auth-header';

class scheduleServices {
     
    create(data){
      return http.post(`/schedule`, data, { headers: authHeader()})
    }

    getSchedule(data) {
      return http.get(`/schedule/${data.projectId}/${data.scheduleId}`, { headers: authHeader()});
    }

    update(id, data) {
      return http.put(`/schedule/${id}`, data, { headers: authHeader()})
    }

    delete(data) {
      return http.delete(`/schedule/${data.projectId}/${data.scheduleId}`, { headers: authHeader()});
    }
}

export default new scheduleServices();