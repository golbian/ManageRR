// import http from "../http-common";
import axios from 'axios';
import authHeader from './auth-header';

class ImportService {
  upload(file) {
    let formData = new FormData();
    formData.append('file', file);
    return axios.post("http://localhost:8080/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  }

  // getFiles() {
  //   return http.get("/files",{ headers: authHeader() } );
  // }
}

export default new ImportService();
