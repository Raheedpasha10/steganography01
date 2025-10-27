import toast from 'react-hot-toast'

export const notify = {
  success: (message) => 
    toast.success(message, {
      style: {
        background: '#10b981',
        color: '#fff',
      },
    }),
  
  error: (message) =>
    toast.error(message, {
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    }),
  
  loading: (message) =>
    toast.loading(message),
  
  promise: (promise, messages) =>
    toast.promise(promise, messages),
}
