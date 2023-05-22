import React, { useState, useEffect } from "react";

import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/db";

import { User, Protocolo } from "@prisma/client";
import Head from "next/head";
import Table from "@/components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

interface RowActionsProps {
  protocolo: Protocolo & { user: User };
}
const RowActions = ({ protocolo }: RowActionsProps) => {
  const handlePrint = () => {
    let win = window.open();
    win.document.write(`
      <html>
        <head><title>Senha</title></head>
        <body style="margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: flex-start; font-family: Arial, Helvetica, sans-serif;">
          <p style="margin: 0; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PREFEITURA DE MESQUITA</p>
          <img src="" alt="Logo" width="80" height="80" style="align-self: center; margin: 0.5rem 0;">
          <p style="margin: 0.25rem; text-align: start; font-size: 16px; font-weight: bold; align-self:center;">PROTOCOLO</p>
          ${protocolo.num_inscricao
            ? `<p style="margin: 0.25rem; text-align: start; font-size: 12px;"><b>N° DE INSCRIÇÃO:</b> <span style="border-bottom: 1px solid black;">${protocolo.num_inscricao}</span></p>`
            : ""
          }
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
  };

  return (
    <div className="flex justify-center gap-2">
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
    </div>
  );
};

interface ProtocoloIndexProps {
  protocolosList: (Protocolo & { user: User })[];
}
const ProtocoloIndex = ({ protocolosList }: ProtocoloIndexProps) => {
  const [protocolos, setProtocolos] = useState<(Protocolo & { user: User })[]>([]);

  useEffect(() => {
    setProtocolos(protocolosList);
  }, []);

  const columnHelper = createColumnHelper<Protocolo & { user: User }>();
  const columns = [
    columnHelper.accessor("num_inscricao", {
      header: "N° de Inscrição",
      cell: (info) => info.getValue(),
      sortingFn: "basic",
      filterFn: "numToString",
      size: 92,
    }),
    columnHelper.accessor("num_processo", {
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
    columnHelper.accessor("cpf", {
      header: "CPF",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      size: 125,
    }),
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
        <Table<Protocolo & { user: User }>
          data={protocolos}
          columns={columns}
        />
      </div>
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
      include: { user: true },
    });
    return {
      props: {
        protocolosList: protocolos,
      },
    };
  }
};

ProtocoloIndex.layout = "dashboard";
export default ProtocoloIndex;
