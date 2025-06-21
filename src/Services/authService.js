// Re-export the new authApi service for backward compatibility
// This ensures existing code that imports from this path continues to work
import authApi from "./api/authApi";

export default authApi;
