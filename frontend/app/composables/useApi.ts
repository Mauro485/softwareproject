export const useApi = () => {
  const baseURL = 'http://localhost:5000/api'

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')

      if (token) {
        return {
          Authorization: `Bearer ${token}`
        }
      }
    }

    return {}
  }

  const get = async (url: string) => {
    return await $fetch(`${baseURL}${url}`, {
      headers: getAuthHeaders()
    })
  }

  const post = async (url: string, data: any) => {
    return await $fetch(`${baseURL}${url}`, {
      method: 'POST',
      body: data,
      headers: getAuthHeaders()
    })
  }

  return {
    get,
    post
  }
}