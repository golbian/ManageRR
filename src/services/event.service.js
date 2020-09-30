import http from "../http-common";
import authHeader from './auth-header';

class eventServices {
     
    createEvent(data){
      return http.post(`/events`, data, { headers: authHeader()})
    }

    getAllEvents() {
      return http.get(`/events`, { headers: authHeader()});
    }

    getEvent(id) {
      return http.get(`/events/${id}`, { headers: authHeader()});
    }

    updateEvent(id, data) {
      return http.put(`/events/${id}`, data, { headers: authHeader()})
    }

    deleteEvent(id) {
      return http.delete(`/events/${id}`, { headers: authHeader()});
    }
}

export default new eventServices();