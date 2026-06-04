import apiClient from "../../core/api/apiClient";

const invoiceApi = {
  getInvoices:   (params = {}) =>
    apiClient.get('/admin/invoices', { params }).then(r => r.data),

  getInvoice:    (id) =>
    apiClient.get(`/admin/invoices/${id}`).then(r => r.data),

  generateInvoice: (orderId) =>
    apiClient.post(`/admin/invoices/generate/${orderId}`).then(r => r.data),

  // Downloads PDF directly to browser
  downloadPDF: async (id, invoiceNumber) => {
    const res = await apiClient.get(`/admin/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href  = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};

export default invoiceApi;
