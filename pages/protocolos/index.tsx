import React, { useState, useEffect } from "react";
import Router from "next/router";

import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/db";

import { User, Protocolo } from "@prisma/client";
import Head from "next/head";
import Table from "@/components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

import { useAtom } from "jotai";
import { notificationAtom } from "@/components/store/store";
import { useSession } from "next-auth/react";
import Link from "next/dist/client/link";

import { AppDialog, AppNotification } from "@/types/interfaces";
import ConfirmationDialog from "@/components/UI/ConfirmationDialog";
import FlyingNotification from "@/components/UI/FlyingNotification";

interface RowActionsProps {
  protocolo: Protocolo & { creator: User; editor?: User };
}
const RowActions = ({ protocolo }: RowActionsProps) => {
  const [notification, setNotification] = useAtom(notificationAtom);
  const { data: session } = useSession();

  const dialogInitialState: AppDialog = {
    isOpen: false,
    message: "",
    accept: () => {},
    reject: () => {},
  };

  const [dialog, setDialog] = useState<AppDialog>(dialogInitialState);

  const handleConfirmation = (
    accept: () => void,
    message: string = "Deseja confimar a operação?",
    reject = () => {
      setDialog((st) => dialogInitialState);
    }
  ) => {
    setDialog({
      isOpen: true,
      accept,
      reject,
      message,
    });
  };

  const handleSendWhatsApp = async () => {
    try {
      setDialog(dialogInitialState);
      const response = await fetch("/api/protocolos/send-whatsapp", {
        method: "POST",
        body: JSON.stringify({
          id: protocolo.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      Router.replace(Router.asPath);
      setNotification({ type: "success", message: data.message });
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      setDialog(dialogInitialState);
    }
  };

  const handlePrint = () => {
    let win = window.open();
    win.document.write(`
      <html>
        <head><title>Senha</title></head>
        <body style="margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
          <p style="margin: 0; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PREFEITURA DE MESQUITA</p>
          <img src="" alt="Logo" width="80" height="80" style="align-self: center; margin: 0.5rem 0;">
          <p style="margin: 0.25rem; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PROTOCOLO</p>
          ${
            protocolo.num_inscricao
              ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE INSCRIÇÃO:</b> <span style="border-bottom: 1px solid black;">${protocolo.num_inscricao}</span></p>`
              : ""
          }
          <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE PROCESSO:</b> <span style="border-bottom: 1px solid black;">${
            protocolo.processo
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
            protocolo.cnpj
              ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>CNPJ:</b> <span style="border-bottom: 1px solid black;">${protocolo.cnpj}</span></p>`
              : ""
          }
          ${
            protocolo.telefone
              ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>TELEFONE:</b> <span style="border-bottom: 1px solid black;">${protocolo.telefone}</span></p>`
              : ""
          }
          <p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>PROTOCOLISTA:</b> <span style="border-bottom: 1px solid black;">${protocolo.creator.name.split(" ")[0].toUpperCase()}</span></p>
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
  };

  const handleDeactivate = async () => {
    try {
      setDialog(dialogInitialState);
      const response = await fetch(
        `/api/protocolos/${protocolo.id}/deactivate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      Router.replace(Router.asPath);
      setNotification({ type: "success", message: data.message });
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      setDialog(dialogInitialState);
    }
  };

  return (
    <div className="flex justify-start gap-2">
      <button
        className="ratio-square rounded bg-blue-500 p-2 text-white transition-colors hover:bg-blue-700"
        title="Imprimir protocolo."
        onClick={handlePrint}
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
      </button>
      {protocolo.telefone && (
        <button
          className="ratio-square rounded bg-green-600 p-2 text-white transition-colors hover:bg-green-700"
          title="Notificar por WhatsApp."
          onClick={() =>
            handleConfirmation(
              handleSendWhatsApp,
              "Você está prestes a enviar uma notificação por WhatsApp."
            )
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </button>
      )}
      {session && session.user.role === "SUPERADMIN" && (
        <>
          <Link
            href={`/protocolos/${protocolo.id}/edit`}
            className="ratio-square rounded bg-yellow-500 p-2 text-white transition-colors hover:bg-yellow-700"
            title={`Editar informações do protocolo.`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
            </svg>
          </Link>
          {!protocolo.deleted_at ? (
            <button
              className="ratio-square rounded bg-red-500 p-2 text-white transition-colors hover:bg-red-700"
              title={`Arquivar o protocolo.`}
              onClick={() =>
                handleConfirmation(
                  handleDeactivate,
                  "Você está prestes a arquivar o protocolo."
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1h-2z"
                />
                <path
                  fillRule="evenodd"
                  d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                />
              </svg>
            </button>
          ) : (
            <button
              className="ratio-square rounded bg-green-500 p-2 text-white transition-colors hover:bg-green-700"
              title={`Desarquivar o protocolo.`}
              onClick={() =>
                handleConfirmation(
                  handleDeactivate,
                  "Você está prestes a desarquivar o protocolo."
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
                />
                <path
                  fillRule="evenodd"
                  d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
                />
              </svg>
            </button>
          )}
        </>
      )}
      {dialog.isOpen && (
        <ConfirmationDialog
          accept={dialog.accept}
          reject={dialog.reject}
          message={dialog.message}
        />
      )}
    </div>
  );
};

interface ProtocoloIndexProps {
  protocolos: (Protocolo & { creator: User, editor?: User; })[];
}
const ProtocoloIndex = ({ protocolos }: ProtocoloIndexProps) => {
  const columnHelper = createColumnHelper<Protocolo & { creator: User; editor?: User }>();
  const columns = [
    columnHelper.accessor("num_inscricao", {
      header: "N° de Inscrição",
      cell: (info) => info.getValue(),
      sortingFn: "basic",
      filterFn: "numToString",
      size: 92,
    }),
    columnHelper.accessor("processo", {
      header: "N° do Processo",
      cell: (info) => info.getValue(),
      sortingFn: "basic",
      filterFn: "numToString",
      size: 107,
    }),
    columnHelper.accessor("assunto", {
      header: "Assunto",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
    }),
    columnHelper.accessor("anos_analise", {
      header: "Anos p/ Análise",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      size: 101,
    }),
    columnHelper.accessor("nome", {
      header: "Nome",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
    }),
    columnHelper.accessor((row) => `${row.cpf.length ? row.cpf : row.cnpj}`, {
      header: "CPF/CNPJ",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      size: 125,
    }),
    // columnHelper.accessor("cpf", {
    //   header: "CPF",
    //   cell: (info) => info.getValue(),
    //   sortingFn: "alphanumeric",
    //   filterFn: "includesString",
    //   size: 125,
    // }),
    columnHelper.accessor("telefone", {
      header: "Telefone",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      size: 122,
    }),
    columnHelper.accessor(
      (row) =>
        row.created_at.toLocaleDateString("pt-br", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }),
      {
        id: "created_at",
        header: "Data",
        cell: (info) => info.getValue().replace(",", "").split(" ")[0],
        sortingFn: "stringDate",
        sortDescFirst: true,
        filterFn: "includesString",
        size: 107,
      }
    ),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (props) => <RowActions protocolo={props.row.original} />,
      size: 70,
    }),
  ];
  const [notification, setNotification] =
    useAtom<AppNotification>(notificationAtom);

  return (
    <>
      <Head>
        <title>Lista de Protocolos</title>
        <meta
          name="description"
          content="Sistema Gerenciador de Projetos — Prefeitura de Mesquita."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full">
      <h1 className="font-bold text-xl text-center">Protocolos</h1>
        <Table<Protocolo & { creator: User; editor?: User }>
          data={protocolos}
          columns={columns}
        />
      </div>
      {notification.message && <FlyingNotification />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  ProtocoloIndexProps
> = async (context) => {
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
    const protocolos = await prisma.protocolo.findMany({
      include: { creator: true, editor: true },
      where: {
        deleted_at: null,
      },
    });
    return {
      props: {
        protocolos,
      },
    };
  }
};

ProtocoloIndex.layout = "dashboard";
export default ProtocoloIndex;
