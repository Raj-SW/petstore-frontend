# Admin API Audit Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every frontend API call that targets a wrong path, wrong HTTP method, or a non-existent backend endpoint, so the admin portal and user-facing pages work correctly against the real backend.

**Architecture:** All frontend API calls go through `src/Services/api/*.js` thin wrappers that use `apiClient` (which handles JWT auth headers and dev proxy). The backend is an Express app mounted at `/api/*`. Fixes are purely path/method corrections in the frontend api files, plus one missing backend endpoint (`PATCH /admin/users/:id/status`) which needs to be added.

**Tech Stack:** React 18 + Vite (frontend), Express + Mongoose (backend), JWT auth via `Authorization: Bearer` header.

---

## Backend Route Reference (ground truth)

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/forgot-password
PATCH  /api/auth/reset-password          ← PATCH not POST
POST   /api/auth/resend-verification

GET    /api/users/me                     (auth)
PATCH  /api/users/update-profile         (auth)
PATCH  /api/users/change-password        (auth)
DELETE /api/users/delete-account         (auth)

GET    /api/products                     (public)
GET    /api/products/category/:category  (public)
GET    /api/products/analytics/overview  (admin)
GET    /api/products/:id                 (public)
POST   /api/products                     (admin, multipart)
PATCH  /api/products/:id                 (admin, multipart) ← PATCH not PUT
DELETE /api/products/:id                 (admin)

GET    /api/orders/my-orders             (auth, customer)  ← not GET /orders
POST   /api/orders                       (auth)
GET    /api/orders/:id                   (auth)
PATCH  /api/orders/:id/cancel            (auth)            ← PATCH not DELETE
GET    /api/orders                       (admin only)
PATCH  /api/orders/:id/status            (admin)           ← PATCH not PUT
PATCH  /api/orders/:id/payment           (admin)

GET    /api/appointments/professional/:professionalId  (public)
POST   /api/appointments                 (auth)
GET    /api/appointments/my-appointments (auth)
GET    /api/appointments/professional-appointments (isServiceProvider)
GET    /api/appointments/:appointmentId  (auth)
PATCH  /api/appointments/:appointmentId/status (auth)
DELETE /api/appointments/:appointmentId  (auth)

GET    /api/admin/dashboard              (admin)
GET    /api/admin/analytics/sales        (admin)
GET    /api/admin/analytics/products     (admin)
GET    /api/admin/analytics/users        (admin)
GET    /api/admin/analytics/appointments (admin)
GET    /api/admin/users                  (admin)
PATCH  /api/admin/users/:id/role         (admin)
PATCH  /api/admin/users/:id/status       (admin) ← TO BE ADDED
DELETE /api/admin/users/:id              (admin)
GET    /api/admin/appointments           (admin)

GET    /api/professionals                (public)
GET    /api/professionals/available      (public)
GET    /api/professionals/role/:role     (public)
GET    /api/professionals/:id            (public)
PATCH  /api/professionals/:id/profile    (isServiceProvider)
PATCH  /api/professionals/:id/availability (isServiceProvider)
PATCH  /api/professionals/:id/status     (isServiceProvider)
PATCH  /api/professionals/:id/rating     (admin)
PATCH  /api/professionals/:id            (admin)
```

---

## Files Modified

**Backend:**
- Modify: `backend/src/controllers/admin.controller.js` — add `toggleUserStatus`
- Modify: `backend/src/routes/admin.routes.js` — add `PATCH /users/:id/status` route

**Frontend:**
- Modify: `frontend/src/Services/api/usersApi.js`
- Modify: `frontend/src/Services/api/ordersApi.js`
- Modify: `frontend/src/Services/api/productsApi.js`
- Modify: `frontend/src/Services/api/authApi.js`
- Modify: `frontend/src/Services/api/professionalsApi.js`
- Modify: `frontend/src/Pages/Admin/Users/AdminUsers.jsx` — fix ROLE_OPTIONS

---

## Task 1: Add missing backend endpoint — toggle user active status

The User model has a top-level `isActive: Boolean` field. The admin portal needs `PATCH /admin/users/:id/status` to toggle it. This endpoint doesn't exist yet.

**Files:**
- Modify: `backend/src/controllers/admin.controller.js`
- Modify: `backend/src/routes/admin.routes.js`

- [ ] **Step 1: Add `toggleUserStatus` to `admin.controller.js`**

Open `backend/src/controllers/admin.controller.js`. Add this export at the end of the file (after `getAllAppointments`):

```js
// Toggle user active/inactive status (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid user ID format', 400));
    }

    if (req.user._id.toString() === id) {
      return next(new AppError('You cannot change your own active status', 400));
    }

    if (typeof isActive !== 'boolean') {
      return next(new AppError('isActive must be a boolean', 400));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 2: Register the route in `admin.routes.js`**

Open `backend/src/routes/admin.routes.js`. Add `toggleUserStatus` to the destructured imports and register the route:

```js
const {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
  getAppointmentAnalytics,
  listUsers,
  updateUserRole,
  deleteUser,
  getAllAppointments,
  toggleUserStatus,           // ← add this
} = require('../controllers/admin.controller');
```

Then add the route after the existing user management routes:

```js
// User management routes
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);  // ← add this line
router.delete('/users/:id', deleteUser);
```

- [ ] **Step 3: Manually test the endpoint**

With the backend running locally (`npm run dev` in the backend folder), log in as admin in Postman/browser, then send:

```
PATCH http://localhost:5000/api/admin/users/<some-user-id>/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "isActive": false }
```

Expected: `200 { success: true, data: { ...user, isActive: false } }`

- [ ] **Step 4: Commit backend changes**

```bash
cd backend
git add src/controllers/admin.controller.js src/routes/admin.routes.js
git commit -m "feat(admin): add PATCH /admin/users/:id/status endpoint"
```

---

## Task 2: Fix `usersApi.js` — wrong admin paths + remove dead methods

**Files:**
- Modify: `frontend/src/Services/api/usersApi.js`

- [ ] **Step 1: Rewrite `usersApi.js` with correct endpoints**

Replace the entire file content:

```js
import { api } from "../../core/api/apiClient";

const usersApi = {
  // Get all users with pagination and optional role filter (Admin only)
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/users${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Update user role (Admin only)
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user active/inactive status (Admin only)
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get pets belonging to the logged-in user
  getUserPets: async () => {
    const response = await api.get(`/pets`);
    return response.data.data;
  },
};

export default usersApi;
```

**Removed (no backend endpoints):** `getUserById`, `updateUser`, `getUserStats`, `searchUsers`
**Fixed paths:** `deleteUser` `/users/:id` → `/admin/users/:id`, `updateUserRole` `/users/:id/role` → `/admin/users/:id/role`, `toggleUserStatus` `/users/:id/status` → `/admin/users/:id/status`

- [ ] **Step 2: Fix `ROLE_OPTIONS` in `AdminUsers.jsx`**

Open `frontend/src/Pages/Admin/Users/AdminUsers.jsx`. Line 9:

```js
// Before
const ROLE_OPTIONS = ["user", "admin", "professional", "petOwner", "petSitter", "veterinarian"];

// After
const ROLE_OPTIONS = ["customer", "veterinarian", "groomer", "trainer", "petTaxi", "admin"];
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/Services/api/usersApi.js src/Pages/Admin/Users/AdminUsers.jsx
git commit -m "fix(api): correct admin user endpoint paths and role options"
```

---

## Task 3: Fix `ordersApi.js` — wrong paths, wrong methods, remove dead methods

**Files:**
- Modify: `frontend/src/Services/api/ordersApi.js`

- [ ] **Step 1: Rewrite `ordersApi.js` with correct endpoints**

Replace the entire file content:

```js
import { api } from "../../core/api/apiClient";

const ordersApi = {
  // Create a new order (customer)
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Get the logged-in user's own orders (customer)
  getMyOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/my-orders${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get ALL orders (Admin only)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin only) — PATCH not PUT
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order — PATCH /orders/:id/cancel, not DELETE /orders/:id
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default ordersApi;
```

**Fixed:** `getMyOrders` `/orders` → `/orders/my-orders`, `updateOrderStatus` PUT→PATCH, `cancelOrder` DELETE `/orders/:id` → PATCH `/orders/:id/cancel`
**Removed (no endpoints):** `getOrderStats`, `exportOrders`

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/ordersApi.js
git commit -m "fix(api): correct order endpoint paths and HTTP methods"
```

---

## Task 4: Fix `productsApi.js` — wrong method, remove dead methods

**Files:**
- Modify: `frontend/src/Services/api/productsApi.js`

- [ ] **Step 1: Rewrite `productsApi.js` with correct endpoints**

Replace the entire file content:

```js
import { api } from "../../core/api/apiClient";

const productsApi = {
  // Get all products with pagination and filters (public)
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/products${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get single product by ID (public)
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (Admin only — multipart/form-data)
  createProduct: async (formData) => {
    const response = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update product (Admin only — multipart/form-data) — PATCH not PUT
  updateProduct: async (id, formData) => {
    const response = await api.patch(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get featured products (public)
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get(`/products?featured=true&limit=${limit}`);
    return response.data;
  },

  // Search products (public)
  searchProducts: async (searchTerm, params = {}) => {
    const queryParams = { search: searchTerm, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Get product analytics overview (Admin only)
  getProductAnalytics: async () => {
    const response = await api.get("/products/analytics/overview");
    return response.data;
  },
};

export default productsApi;
```

**Fixed:** `updateProduct` PUT→PATCH (with correct multipart headers), `createProduct` now sends multipart headers correctly
**Removed (no endpoints):** `uploadProductImage`, `getCategories`
**Added:** `getProductAnalytics` (endpoint exists at `/products/analytics/overview`)

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/productsApi.js
git commit -m "fix(api): correct product endpoint methods, add analytics, remove dead methods"
```

---

## Task 5: Fix `authApi.js` — wrong HTTP method on resetPassword

**Files:**
- Modify: `frontend/src/Services/api/authApi.js`

- [ ] **Step 1: Fix `resetPassword` method — POST → PATCH**

In `frontend/src/Services/api/authApi.js`, find the `resetPassword` method:

```js
// Before
resetPassword: async (token, password) => {
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
},

// After
resetPassword: async (token, password) => {
  const response = await api.patch("/auth/reset-password", { token, password });
  return response.data;
},
```

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/authApi.js
git commit -m "fix(api): resetPassword uses PATCH not POST"
```

---

## Task 6: Fix `professionalsApi.js` — remove non-existent stats endpoint

**Files:**
- Modify: `frontend/src/Services/api/professionalsApi.js`

- [ ] **Step 1: Remove `getProfessionalStats` method**

In `frontend/src/Services/api/professionalsApi.js`, delete the entire `getProfessionalStats` method (lines 74-78):

```js
// Remove this entire block — no backend endpoint exists:
// getProfessionalStats: async (id) => {
//   const response = await api.get(`/professionals/${id}/stats`);
//   return response.data;
// },
```

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/professionalsApi.js
git commit -m "fix(api): remove getProfessionalStats — endpoint does not exist"
```

---

## Task 7: Verify all admin pages load without errors

Manual verification checklist — open the browser with the local dev server running (`npm run dev` in frontend, `npm run dev` in backend), log in as admin.

- [ ] **Step 1: Admin Dashboard** — navigate to `/admin`. Confirm stat cards and recent orders/appointments load. No 4xx errors in the network tab.

- [ ] **Step 2: Admin Users** — navigate to `/admin/users`. Confirm user list loads. Try changing a user's role (should call `PATCH /admin/users/:id/role`). Try toggling active status (should call `PATCH /admin/users/:id/status`). Try deleting a non-admin user.

- [ ] **Step 3: Admin Orders** — navigate to `/admin/orders`. Confirm order list loads (calls `GET /orders`). Try updating an order status (should call `PATCH /orders/:id/status` not PUT).

- [ ] **Step 4: Admin Appointments** — navigate to `/admin/appointments`. Confirm appointment list loads (calls `GET /admin/appointments`).

- [ ] **Step 5: Admin Products** — navigate to `/admin/products`. Confirm product list loads.

- [ ] **Step 6: User-facing Orders** — log in as a customer and navigate to profile/orders. Confirm `GET /orders/my-orders` is called (not `GET /orders`).

- [ ] **Step 7: Commit verification note**

```bash
git add -A
git commit -m "chore: admin api audit complete — all endpoints verified"
```
