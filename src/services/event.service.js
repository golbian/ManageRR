import http from "../http-common";
import authHeader from './auth-header';

class eventServices {
     
    create(data){
      return http.post(`/events`, data, { headers: authHeader()})
    }

    getAllEvents() {
      return http.get(`/events`, { headers: authHeader()});
    }

    getAllAdminEvents() {
      return http.get(`/events/admin`, { headers: authHeader()});
    }

    getAllOwnerEvents(user) {
      return http.get(`/events/user/${user}`,{ headers: authHeader() });
    }

    getEvent(id) {
      return http.get(`/events/${id}`, { headers: authHeader()});
    }

    update(id, data) {
      return http.put(`/events/${id}`, data, { headers: authHeader()})
    }

    delete(id) {
      return http.delete(`/events/${id}`, { headers: authHeader()});
    }
}

export default new eventServices();