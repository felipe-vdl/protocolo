import Head from "next/head";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { AppNotification } from "@/types/interfaces";
import React, { useState } from "react";
import { Protocolo, User } from "@prisma/client";
import InputMask from "react-input-mask";

interface NewProtocoloResponse {
  message: string;
  protocolo?: Protocolo & {
    user: User;
  };
}

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
  const [form, setForm] = useState<{
    num_inscricao: string;
    num_processo: string;
    assunto: string;
    anos_analise: string;
    nome: string;
    cpf: string;
    telefone: string;
    enviar_whatsapp: boolean;
  }>(formInitialState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      if (
        form.num_inscricao.trim().length &&
        form.num_processo.trim().length &&
        form.nome.trim().length &&
        form.assunto.trim().length
        ) {
        const submitter = document.activeElement as HTMLButtonElement;
        setNotification(notificationInitialState);
        setIsLoading(true);
        const response = await fetch("/api/protocolo/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
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
      } else {
        setNotification({
          type: "error",
          message: "Preencha as informações.",
        });
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
                placeholder="CPF"
                value={form.cpf}
                name="cpf"
                onChange={handleChange}
              />
              <InputMask
                minLength={14}
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
              className="flex-1 rounded-[10px] bg-green-600 p-1 text-lg font-light text-white hover:bg-green-500 disabled:bg-green-400"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button
              title="Salvar e imprimir o protocolo."
              value="PRINT"
              disabled={isLoading}
              className="flex-1 rounded-[10px] bg-blue-600 p-1 text-lg font-light text-white hover:bg-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? "Salvando..." : "Salvar & Imprimir"}
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
