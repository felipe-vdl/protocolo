import ReactDOM from 'react-dom'

interface ConfirmationDialogProps {
  message: string;
  accept: () => any;
  reject: () => any;
}

export default function ConfirmationDialog ({ message, accept, reject }: ConfirmationDialogProps) {
  return ReactDOM.createPortal(
      <>
        <div className="z-30 h-screen w-screen fixed bg-black/30 backdrop-blur-sm" onClick={reject}></div>
        <div className="w-1/3 p-4 rounded flex flex-col gap-3 fixed top-1/2 left-1/2 bg-light-500 dark:bg-dark-500 z-40 translate-x-[-50%] translate-y-[-50%]">
          <h2 className="text-light-50 dark:text-dark-50 text-center">{message}</h2>
          <div className="w-full flex gap-4">
            <button onClick={accept} className="text-white flex-1 bg-roxo px-4 py-1 rounded hover:bg-indigo-500">Confirmar</button>
            <button onClick={reject} className="flex-1 bg-zinc-400 px-4 py-1 rounded text-white hover:bg-zinc-300">Cancelar</button>
          </div>
        </div>
      </>
    , document.querySelector<HTMLDivElement>("#modal"));
}