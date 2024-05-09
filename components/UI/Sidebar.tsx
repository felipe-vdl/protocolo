import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Dropdown from "./Dropdown";

export default function Sidebar() {
  const { data: session } = useSession();
  const [sidebarIsCollapsed, setSidebarIsCollapsed] = useState<boolean>(true);

  return (
    <div className="sticky left-[-0.1%] z-20 flex bg-light-900 text-light-50 shadow shadow-black/30 dark:bg-dark-900 dark:text-dark-50">
      <ul
        className={`flex ${
          sidebarIsCollapsed ? "" : "sm:min-w-[12rem]"
        } flex-col border-r border-light-500 dark:border-dark-500`}
      >
        <button
          title="Expandir/Contrair"
          onClick={() => setSidebarIsCollapsed((st) => !st)}
          className={`${
            sidebarIsCollapsed ? "mx-auto" : "ml-auto mr-2"
          } mt-2 mb-1 rounded bg-zinc-200 p-2 text-zinc-800 hover:bg-zinc-300 dark:bg-dark-500 dark:text-white hover:dark:bg-zinc-600`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            {sidebarIsCollapsed ? (
              <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
            ) : (
              <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
            )}
          </svg>
        </button>
        <Dropdown
          sidebarIsCollapsed={sidebarIsCollapsed}
          section={{
            id: "protocolos",
            title: "Protocolos",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.188 10H7V6.5h1.188a1.75 1.75 0 1 1 0 3.5z" />
                <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM7 5.5a1 1 0 0 0-1 1V13a.5.5 0 0 0 1 0v-2h1.188a2.75 2.75 0 0 0 0-5.5H7z" />
              </svg>
            ),
          }}
          links={[
            {
              title: "Novo Protocolo",
              href: "/protocolos/new",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z" />
                </svg>
              ),
            },
            {
              title: "Lista de Protocolos",
              href: "/protocolos",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z" />
                </svg>
              ),
            },
            {
              sessionRoles: ["SUPERADMIN"],
              title: "Protocolos Arquivados",
              href: "/protocolos/archive",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z" />
                </svg>
              ),
            },
          ]}
        />
        <Dropdown
          sidebarIsCollapsed={sidebarIsCollapsed}
          section={{
            id: "capas",
            title: "Capas",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M7 6.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.861 1.542 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V9.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V9s1.54-1.274 1.639-1.208M5 11h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1" />
              </svg>
            ),
          }}
          links={[
            {
              title: "Nova Capa",
              href: "/capas/new",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z" />
                </svg>
              ),
            },
            {
              title: "Lista de Capas",
              href: "/capas",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z" />
                </svg>
              ),
            },
            {
              sessionRoles: ["SUPERADMIN"],
              title: "Capas Arquivadas",
              href: "/capas/archive",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z" />
                </svg>
              ),
            },
          ]}
        />
        {session &&
          (session.user.role === "ADMIN" ||
            session.user.role === "SUPERADMIN") && (
            <Dropdown
              sidebarIsCollapsed={sidebarIsCollapsed}
              section={{
                id: "configuracoes",
                title: "Configurações",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                  </svg>
                ),
              }}
              links={[
                {
                  title: "Criar Usuário",
                  href: "/users/new",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      <path
                        fillRule="evenodd"
                        d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Lista de Usuários",
                  href: "/users",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    </svg>
                  ),
                },
                {
                  title: "Criar Assunto",
                  href: "/assuntos/new",
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V2C16 1.46957 15.7893 0.960859 15.4142 0.585786C15.0391 0.210714 14.5304 0 14 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786ZM4.082 6.281L6.372 5.994L5.371 10.699C5.3 11.039 5.4 11.232 5.675 11.232C5.869 11.232 6.161 11.162 6.361 10.986L6.273 11.402C5.986 11.748 5.353 12 4.808 12C4.105 12 3.806 11.578 4 10.681L4.738 7.213C4.802 6.92 4.744 6.814 4.45 6.744L4 6.661L4.082 6.281ZM6.14911 4.61311C5.96157 4.80064 5.70722 4.906 5.442 4.906C5.17678 4.906 4.92243 4.80064 4.73489 4.61311C4.54736 4.42557 4.442 4.17122 4.442 3.906C4.442 3.64078 4.54736 3.38643 4.73489 3.19889C4.92243 3.01136 5.17678 2.906 5.442 2.906C5.70722 2.906 5.96157 3.01136 6.14911 3.19889C6.33664 3.38643 6.442 3.64078 6.442 3.906C6.442 4.17122 6.33664 4.42557 6.14911 4.61311ZM9.77723 8.69577V11.031H10.7318V8.69577H13.067V7.74123H10.7318V5.406H9.77723V7.74123H7.442V8.69577H9.77723Z"
                        fill="currentColor"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Lista de Assuntos",
                  href: "/assuntos",
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.14145 0.656605C1.02931 0.905038 0.969697 1.17672 0.969697 1.45455V13.0909C0.969697 13.6053 1.17403 14.0986 1.53773 14.4623C1.90144 14.826 2.39473 15.0303 2.90909 15.0303H14.5455C14.8233 15.0303 15.095 14.9707 15.3434 14.8585C15.2479 15.0701 15.1144 15.2647 14.9471 15.432C14.5834 15.7957 14.0901 16 13.5758 16H1.93939C1.42503 16 0.931742 15.7957 0.568035 15.432C0.204328 15.0683 0 14.575 0 14.0606V2.42424C0 1.90988 0.204328 1.41659 0.568035 1.05288C0.735289 0.88563 0.929946 0.75208 1.14145 0.656605Z"
                        fill="currentColor"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.88057 0.426027C2.15335 0.153246 2.52332 0 2.90909 0H14.5455C14.9312 0 15.3012 0.153246 15.574 0.426027C15.8468 0.698807 16 1.06878 16 1.45455V13.0909C16 13.4767 15.8468 13.8466 15.574 14.1194C15.3012 14.3922 14.9312 14.5455 14.5455 14.5455H2.90909C2.52332 14.5455 2.15335 14.3922 1.88057 14.1194C1.60779 13.8466 1.45455 13.4767 1.45455 13.0909V1.45455C1.45455 1.06878 1.60779 0.698807 1.88057 0.426027ZM7.40848 6.18182L9.62909 5.90352L8.65842 10.4659C8.58958 10.7956 8.68655 10.9828 8.95321 10.9828C9.14133 10.9828 9.42448 10.9149 9.61842 10.7442L9.53309 11.1476C9.25479 11.4832 8.64097 11.7275 8.11249 11.7275C7.43079 11.7275 7.14085 11.3183 7.32897 10.4485L8.04461 7.08558C8.10667 6.80145 8.05042 6.69867 7.76533 6.63079L7.32897 6.5503L7.40848 6.18182ZM9.41295 4.56447C9.2311 4.74632 8.98445 4.84848 8.72727 4.84848C8.47009 4.84848 8.22345 4.74632 8.04159 4.56447C7.85974 4.38261 7.75758 4.13597 7.75758 3.87879C7.75758 3.62161 7.85974 3.37496 8.04159 3.19311C8.22345 3.01126 8.47009 2.90909 8.72727 2.90909C8.98445 2.90909 9.2311 3.01126 9.41295 3.19311C9.59481 3.37496 9.69697 3.62161 9.69697 3.87879C9.69697 4.13597 9.59481 4.38261 9.41295 4.56447Z"
                        fill="currentColor"
                      />
                    </svg>
                  ),
                },
              ]}
            />
          )}
      </ul>
    </div>
  );
}
