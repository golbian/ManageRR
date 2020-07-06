import http from "../http-common";

class scheduleServices {
     
    createSchedule(data){
      return http.post("/schedule", data)
    }

    updateSchedule(id, data) {
      return http.put(`/schedule/${id}`, data)
    }

    deleteSchedule(data) {
      return http.delete(`/schedule`, {data});
    }
}

export default new scheduleServices();