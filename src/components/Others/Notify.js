import { toast } from 'react-toastify';
import { colors } from "./Colors";

export const notify = (msg) => toast(msg, {
    position: "top-right",
    autoClose: 3000,
    style: { background: colors.lighter, color: colors.white },
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
});