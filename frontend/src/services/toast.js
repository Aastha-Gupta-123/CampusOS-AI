import toast from 'react-hot-toast';

const notify = {
  success: (message) => toast.success(message, {
    duration: 3000,
    position: 'top-right',
  }),
  error: (message) => toast.error(message, {
    duration: 4000,
    position: 'top-right',
  }),
  info: (message) => toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  }),
};

export default notify;