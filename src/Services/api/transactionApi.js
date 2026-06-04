import apiClient from "../../core/api/apiClient";

const transactionApi = {
  getTransactions: (params = {}) =>
    apiClient.get('/admin/transactions', { params }).then(r => r.data),

  getTransaction: (id) =>
    apiClient.get(`/admin/transactions/${id}`).then(r => r.data),
};

export default transactionApi;
