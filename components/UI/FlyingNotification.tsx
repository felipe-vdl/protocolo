import ReactDOM from 'react-dom';
import { AppNotification } from "@/types/interfaces";

interface NotificationProps {
  notification: {
    message: string;
    type: "error" | "success" | "";
    setStateFn: React.Dispatch<React.SetStateAction<AppNotification>>;
  }
}

export default function FlyingNotification({notification: { message, type, setStateFn }}: NotificationProps) {
  const notificationInitialState: AppNotification = {
    message: "",
    type: "",
  };

  return ReactDOM.createPortal(
    <div className={`z-20 px-4 py-2 text-center flex items-center w-full font-medium ${type === "error" ? "bg-red-300 text-red-900" : "bg-green-300 text-green-800"}`}>
      <p className="mx-auto">{message}</p>
      <span className="cursor-pointer hover:text-white" onClick={() => setStateFn(notificationInitialState)}>X</span>
    </div>,
    document.querySelector("#notifications")
  );
}