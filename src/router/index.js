// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true }, // Penjaga Pintu (Satpam)
    },
  ],
});

// --- LOGIC SATPAM (Navigation Guard) ---
// Cek apakah user sudah login sebelum masuk ke /admin
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject,
    );
  });
};

router.beforeEach(async (to, from, next) => {
  // Jika halaman butuh 'requiresAuth' (seperti Admin)
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next(); // Boleh masuk
    } else {
      next("/login"); // Tendang ke login
    }
  } else {
    next(); // Halaman biasa (Home/Login) bebas akses
  }
});

export default router;
