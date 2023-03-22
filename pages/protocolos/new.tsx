import Head from "next/head";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { AppNotification } from "@/types/interfaces";
import React, { useState } from "react";
import { Protocolo, User } from "@prisma/client";
import InputMask from "react-input-mask";
import z from "zod";

interface NewProtocoloResponse {
  message: string;
  protocolo?: Protocolo & {
    user: User;
  };
}

const protocoloFormSchema = z.object({
    num_inscricao: z.string(),
    num_processo: z.string(),
    assunto: z.string(),
    anos_analise: z.string().optional(),
    nome: z.string().min(1, "Informe um nome."),
    cpf: z.string().min(14, "CPF Inválido"),
    telefone: z.union([z.string().length(0, "Telefone Inválido"), z.string().min(13, "Telefone Inválido")]).optional(),
    enviar_whatsapp: z.boolean(),
});

const UserCreate = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(
    notificationInitialState
  );

  const formInitialState = {
    num_inscricao: "",
    num_processo: "",
    assunto: "",
    anos_analise: "",
    nome: "",
    cpf: "",
    telefone: "",
    enviar_whatsapp: false,
  };
  const [form, setForm] = useState<z.infer<typeof protocoloFormSchema>>(formInitialState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      const result = protocoloFormSchema.safeParse(form)
      if (result.success) {
        const submitter = document.activeElement as HTMLButtonElement;
        setNotification(notificationInitialState);
        setIsLoading(true);
        const response = await fetch("/api/protocolo/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const { message, protocolo }: NewProtocoloResponse =
          await response.json();
        setNotification({ type: "success", message });
        setForm(formInitialState);
        setIsLoading(false);

        if (submitter.value === "PRINT") {
          let win = window.open();
          win.document.write(`
            <html>
              <head><title>Senha</title></head>
              <body style="margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
                <p style="margin: 0; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PREFEITURA DE MESQUITA</p>
                <img src="" alt="Logo" width="80" height="80" style="align-self: center; margin: 0.5rem 0;">
                <p style="margin: 0.25rem; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PROTOCOLO</p>
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE INSCRIÇÃO:</b> <span style="border-bottom: 1px solid black;">${
                  protocolo.num_inscricao
                }</span></p>
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE PROCESSO:</b> <span style="border-bottom: 1px solid black;">${
                  protocolo.num_processo
                }</span></p>
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>DATA:</b> <span style="border-bottom: 1px solid black;">${new Date(
                  protocolo.created_at
                ).toLocaleDateString("pt-br")}</span></p>
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>ASSUNTO:</b> <span style="border-bottom: 1px solid black;">${
                  protocolo.assunto
                }</span></p>
                ${
                  protocolo.anos_analise
                    ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>ANOS P/ ANÁLISE:</b> <span style="border-bottom: 1px solid black;">${protocolo.anos_analise}</span></p>`
                    : ""
                }
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>NOME:</b> <span style="border-bottom: 1px solid black;">${
                  protocolo.nome
                }</span></p>
                ${
                  protocolo.cpf
                    ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>CPF:</b> <span style="border-bottom: 1px solid black;">${protocolo.cpf}</span></p>`
                    : ""
                }
                ${
                  protocolo.telefone
                    ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>TELEFONE:</b> <span style="border-bottom: 1px solid black;">${protocolo.telefone}</span></p>`
                    : ""
                }
                <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>PROTOCOLISTA:</b> <span style="border-bottom: 1px solid black;">${protocolo.user.name.toUpperCase()}</span></p>
                <p style="margin: 0.5rem 0.25rem; text-align: start; font-size: 10px; font-weight: bold;">A PARTE SÓ SERÁ ATENTIDA SOB APRESENTAÇÃO DESTE, OU UMA CÓPIA DO MESMO (XEROX).</p>
                <script>
                  const img = new Image();
                  img.src = "/logo-mesquita192.png";
                  document.querySelector("img").src = img.src;
                  img.onload = () => {
                    window.print();
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
        }
      } else if (result.success === false) {
        const {errors} = result.error;

        setNotification({
          type: "error",
          message: `${errors.map(err => err.message).join(", ")}.`,
        });
        /* setNotification({
          type: "error",
          message: "Preencha as informações.",
        }); */
        setIsLoading(false);
      }
    } catch (error) {
      setNotification({
        message: error.message,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  const handleToggle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({ ...st, [evt.target.name]: !st[evt.target.name] }));
  };

  return (
    <>
      <Head>
        <title>Novo Protocolo</title>
      </Head>
      <div className="m-auto flex w-full flex-col items-center rounded-[12px] bg-light-500 text-light-50 shadow shadow-black/20 dark:bg-dark-500 dark:text-dark-50 sm:w-[25rem] md:w-[30rem] lg:w-[38rem]">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center">
          <h2 className="text-2xl font-light text-white">Novo Protocolo</h2>
        </div>
        <form
          className="flex w-full flex-col gap-8 p-4 pt-8"
          onSubmit={handleSubmit}
        >
          {notification.message && (
            <div
              className={`flex w-full items-center rounded-[8px] px-3 py-1 text-center ${
                notification.type === "error"
                  ? "bg-red-300 text-red-800"
                  : "bg-green-300 text-green-800"
              }`}
            >
              <p className="mx-auto">{notification.message}</p>
              <span
                className="cursor-pointer hover:text-white"
                onClick={() => setNotification(notificationInitialState)}
              >
                X
              </span>
            </div>
          )}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6 px-1">
              <input
                type="text"
                onChange={handleChange}
                name="num_inscricao"
                value={form.num_inscricao}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="N° de Inscrição"
                required={true}
              />
              <input
                type="text"
                onChange={handleChange}
                name="num_processo"
                value={form.num_processo}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="N° do Processo"
                required={true}
              />
              <input
                type="text"
                onChange={handleChange}
                name="assunto"
                value={form.assunto}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Assunto"
                required={true}
              />
              <input
                type="text"
                onChange={handleChange}
                name="anos_analise"
                value={form.anos_analise}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Anos p/ Análise"
                required={false}
              />
            </div>
            <div className="flex flex-col gap-6 px-1">
              <input
                type="text"
                onChange={handleChange}
                name="nome"
                value={form.nome}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Nome"
                required={true}
              />
              <InputMask
                required
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                mask="999.999.999-99"
                maskChar={null}
                placeholder="CPF"
                value={form.cpf}
                name="cpf"
                minLength={14}
                onChange={handleChange}
                />
              <InputMask
                required={form.telefone.length > 1}
                minLength={14}
                maskChar={null}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Telefone Celular (WhatsApp)"
                mask="(99)99999-9999"
                value={form.telefone}
                name="telefone"
                onChange={handleChange}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="1"
                  id="enviar_whatsapp"
                  name="enviar_whatsapp"
                  onChange={handleToggle}
                  checked={form.enviar_whatsapp}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="enviar_whatsapp">
                  Enviar notificação por WhatsApp
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <button
              title="Salvar o protocolo sem imprimir."
              value="SAVE"
              disabled={isLoading}
              className="flex flex-1 items-center justify-between gap-2 rounded-[10px] bg-green-600 p-1 px-3 text-lg font-light text-white hover:bg-green-500 disabled:bg-green-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586l-1.239-.757ZM16 4.697v4.974A4.491 4.491 0 0 0 12.5 8a4.49 4.49 0 0 0-1.965.45l-.338-.207L16 4.697Z" />
                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z" />
              </svg>
              <span>{isLoading ? "Salvando..." : "Salvar"}</span>
              <span></span>
            </button>
            <button
              title="Salvar e imprimir o protocolo."
              value="PRINT"
              disabled={isLoading}
              className="flex flex-1 items-center justify-between gap-2 rounded-[10px] bg-blue-600 p-1 px-3 text-lg font-light text-white hover:bg-blue-500 disabled:bg-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
              </svg>
              <span>{isLoading ? "Salvando..." : "Salvar & Imprimir"}</span>
              <span></span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {},
    };
  } else {
    return {
      props: {},
    };
  }
};

UserCreate.layout = "dashboard";
export default UserCreate;
