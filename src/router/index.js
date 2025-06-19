import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/loginBtn.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/registerBtn.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/userProfile",
      name: "userProfile",
      component: () => import("../views/userProfile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/movie/:id",
      name: "movieDetails",
      component: () => import("../views/MovieDetail.vue"),
      props: true,
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next({ name: "home" });
    return;
  }

  // Check for session expiration
  if (userStore.isAuthenticated && userStore.isSessionExpired) {
    userStore.logout();
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Update last activity timestamp
  if (userStore.isAuthenticated) {
    userStore.updateLastActivity();
  }

  next();
});

export default router;
