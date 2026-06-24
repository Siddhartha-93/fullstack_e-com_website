import api from './axiosClient.js'

export const createOrder = (data) => api.post('/orders', data)
export const createPaymentOrder = (orderId) => api.post(`/orders/${orderId}/payment`)
export const verifyPayment = (orderId, data) => api.post(`/orders/${orderId}/payment/verify`, data)
export const createUPIPayment = (orderId, data) => api.post(`/orders/${orderId}/payment/upi`, data)
export const checkUPIPaymentStatus = (orderId) => api.get(`/orders/${orderId}/payment/upi/status`)
export const fetchMyOrders = () => api.get('/orders/my-orders')
export const fetchOrders = () => api.get('/orders')
export const fetchOrderById = (id) => api.get(`/orders/${id}`)
