import Head from "next/head";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { AppNotification } from "@/types/interfaces";
import React, { useState } from "react";
import { Protocolo, User } from "@prisma/client";

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

  const formInitalState = {
    num_inscricao: "",
    num_processo: "",
    nome: "",
    assunto: "",
    anos_analise: "",
  };
  const [form, setForm] = useState<{
    num_inscricao: string;
    num_processo: string;
    nome: string;
    assunto: string;
    anos_analise: string;
  }>(formInitalState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      if (
        form.num_inscricao.trim().length &&
        form.num_processo.trim().length &&
        form.nome.trim().length &&
        form.assunto.trim().length
      ) {
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
        setForm(formInitalState);
        setIsLoading(false);

        let win = window.open();
        win.document.write(`
          <html>
            <head><title>Senha</title></head>
            <body style="margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
              <p style="margin: 0; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PREFEITURA DE MESQUITA</p>
              <img src="" alt="Logo" width="80" height="80" style="align-self: center; margin: 0.5rem 0;">
              <p style="margin: 0.25rem; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PROTOCOLO</p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE INSCRIÇÃO:</b> <span style="border-bottom: 1px solid black;">${protocolo.num_inscricao}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE PROCESSO:</b> <span style="border-bottom: 1px solid black;">${protocolo.num_processo}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>DATA:</b> <span style="border-bottom: 1px solid black;">${new Date(protocolo.created_at).toLocaleDateString("pt-br")}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>NOME:</b> <span style="border-bottom: 1px solid black;">${protocolo.nome}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>ASSUNTO:</b> <span style="border-bottom: 1px solid black;">${protocolo.assunto}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>ANOS P/ ANÁLISE:</b> <span style="border-bottom: 1px solid black;">${protocolo.anos_analise}</span></p>
              <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>PROTOCOLISTA:</b> <span style="border-bottom: 1px solid black;">${protocolo.user.name.toUpperCase()}</span></p>
              <b style="margin: 0.25rem; text-align: start; font-size: 10px;">A PARTE SÓ SERÁ ATENTIDA SOB APRESENTAÇÃO DESTE.</b>
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

  return (
    <>
      <Head>
        <title>SGP Dashboard</title>
      </Head>
      <div className="m-auto flex w-1/3 flex-col items-center rounded-[12px] bg-light-500 text-white shadow shadow-black/20 dark:bg-dark-500">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center">
          <h2 className="text-2xl font-light">Novo Protocolo</h2>
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
              name="nome"
              value={form.nome}
              className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
              placeholder="Nome"
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
          <button
            disabled={isLoading}
            className="rounded-[10px] bg-roxo p-1 text-xl font-light hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? "Criando protocolo..." : "Criar"}
          </button>
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
