export default defineNuxtRouteMiddleware((to, from) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')

    if (!token) {
      return navigateTo('/login')
    }
  }
})