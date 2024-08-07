import React, { useState } from "react";
import Router from "next/router";

import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/db";

import { User, Assunto } from "@prisma/client";
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
  assunto: Assunto & { creator: User; editor?: User };
}
const RowActions = ({ assunto }: RowActionsProps) => {
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

  const handleDeactivate = async () => {
    try {
      setDialog(dialogInitialState);
      const response = await fetch(`/api/assuntos/${assunto.id}/deactivate`, {
        method: "POST",
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

  return (
    <div className="flex justify-start gap-2">
      <Link
        href={`/assuntos/${assunto.id}/edit`}
        className="ratio-square rounded bg-yellow-500 p-2 text-white transition-colors hover:bg-yellow-700"
        title={`Editar informações da assunto.`}
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
      {session && session.user.role === "SUPERADMIN" && (
        <>
          {!assunto.deleted_at ? (
            <button
              className="ratio-square rounded bg-red-500 p-2 text-white transition-colors hover:bg-red-700"
              title={`Arquivar o assunto.`}
              onClick={() =>
                handleConfirmation(
                  handleDeactivate,
                  "Você está prestes a arquivar o assunto."
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
              title={`Desarquivar o assunto.`}
              onClick={() =>
                handleConfirmation(
                  handleDeactivate,
                  "Você está prestes a desarquivar o assunto."
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

interface AssuntoIndexProps {
  assuntos: (Assunto & { creator: User; editor?: User })[];
}
const AssuntoIndex = ({ assuntos }: AssuntoIndexProps) => {
  const columnHelper = createColumnHelper<
    Assunto & { creator: User; editor?: User }
  >();
  const columns = [
    columnHelper.accessor("name", {
      header: "Assunto",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      size: 92,
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
        header: "Data de Criação",
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
      cell: (props) => <RowActions assunto={props.row.original} />,
      size: 70,
    }),
  ];
  const [notification, setNotification] =
    useAtom<AppNotification>(notificationAtom);

  return (
    <>
      <Head>
        <title>Lista de Assuntos</title>
        <meta
          name="description"
          content="Sistema Gerenciador de Projetos — Prefeitura de Mesquita."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full">
        <h1 className="text-center text-xl font-bold">Assuntos</h1>
        <Table<Assunto & { creator: User; editor?: User }>
          data={assuntos}
          columns={columns}
        />
      </div>
      {notification.message && <FlyingNotification />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AssuntoIndexProps> = async (
  context
) => {
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
    const assuntos = await prisma.assunto.findMany({
      include: { creator: true, editor: true },
    });
    return {
      props: {
        assuntos,
      },
    };
  }
};

AssuntoIndex.layout = "dashboard";
export default AssuntoIndex;
