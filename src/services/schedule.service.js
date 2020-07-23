import http from "../http-common";
import authHeader from './auth-header';

class scheduleServices {
     
    createSchedule(data){
      return http.post("/schedule", data, { headers: authHeader()})
    }

    updateSchedule(id, data) {
      return http.put(`/schedule/${id}`, data, { headers: authHeader()})
    }

    deleteSchedule(data) {
      return http.delete(`/schedule`,{data}, { headers: authHeader()});
    }
}

export default new scheduleServices();