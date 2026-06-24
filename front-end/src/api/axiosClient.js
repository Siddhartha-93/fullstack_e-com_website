import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
})



api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})



// Interceptor to handle 401 errors and refresh tokens
// api.interceptors.response.use(
//   response => response,

//   async error => {

//     if (error.response.status === 401) {

//       const refreshResponse =
//         await axios.post( "/auth/refresh-token");

//       const newAccessToken =
//         refreshResponse.data.accessToken;

//       localStorage.setItem(
//         "accessToken",
//         newAccessToken
//       );

//       error.config.headers.Authorization =
//         `Bearer ${newAccessToken}`;

//       return api(error.config);
//     }

//     return Promise.reject(error);
//   }
// );

export default api
