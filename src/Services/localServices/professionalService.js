class ProfessionalService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;
  // Fetch all professionals with optional filters
  static async getAll(params = {}) {
    console.log("API_URL: ", this.API_URL);
    const url = new URL(`${this.API_URL}/professionals`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "")
        url.searchParams.append(key, value);
    });
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to fetch professionals");
    return data.data;
  }

  // Fetch professionals by specialization
  static async getByRole(role) {
    const res = await fetch(`${this.API_URL}/role/${encodeURIComponent(role)}`);
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to fetch professionals");
    return data.data;
  }

  // Fetch a single professional by ID
  static async getById(id) {
    const res = await fetch(`${API_URL}/professionals/${id}`);
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to fetch professional");
    return data.data;
  }
}

export default ProfessionalService;
