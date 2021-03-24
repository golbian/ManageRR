import http from "../http-common";
import authHeader from './auth-header';

class eventServices {
     
    create(data){
      return http.post(`/events`, data, { headers: authHeader()})
    }

    getAllEvents() {
      return http.get(`/events`, { headers: authHeader()});
    }

    getEvent(id) {
      return http.get(`/events/${id}`, { headers: authHeader()});
    }

    getAllEventsPerMonth() {
      return http.get(`/events/month/admin`, { headers: authHeader()});
    }

    getAllPmEvents(pm) {
      return http.get(`/events/pm/${pm}`,{ headers: authHeader() });
    }

    getAllKamEvents(kam) {
      return http.get(`/events/kam/${kam}`,{ headers: authHeader() });
    }

    getAllOwnerEvents(user) {
      return http.get(`/events/user/${user}`,{ headers: authHeader() });
    }

    getAllPmEventsPerMonth(pm) {
      return http.get(`/events/month/pm/${pm}`,{ headers: authHeader() });
    }

    getAllKamEventsPerMonth(kam) {
      return http.get(`/events/month/kam/${kam}`,{ headers: authHeader() });
    }

    getAllOwnerEventsPerMonth(user) {
      return http.get(`/events/month/user/${user}`,{ headers: authHeader() });
    }

    update(id, data) {
      return http.put(`/events/${id}`, data, { headers: authHeader()})
    }

    delete(id) {
      return http.delete(`/events/${id}`, { headers: authHeader()});
    }
}

export default new eventServices();