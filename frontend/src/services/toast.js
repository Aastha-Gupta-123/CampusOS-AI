import toast from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg, { duration: 3000 }),
  error:   (msg) => toast.error(msg,   { duration: 4000 }),
  info:    (msg) => toast(msg,          { duration: 3000, icon: 'ℹ️' }),
  loading: (msg) => toast.loading(msg),
  dismiss: (id)  => toast.dismiss(id),
};

export default notify;
