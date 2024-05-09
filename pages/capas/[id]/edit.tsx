import { Assunto, Capa, User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { prisma } from "@/db";

import { AppNotification } from "@/types/interfaces";
import React, { useState } from "react";
import Head from "next/head";
import InputMask from "react-input-mask";
import z from "zod";

interface EditCapaProps {
  capa: Capa & {
    creator: Pick<User, "id" | "name">;
    editor?: Pick<User, "id" | "name">;
  };
  assuntos: Assunto[];
}

interface UpdateCapaResponse {
  message: string;
  updatedCapa?: Capa & {
    user: Pick<User, "id" | "name">;
  };
}

const editCapaFormSchema = z
  .object({
    num_protocolo: z.string(),
    distribuicao: z.string(),
    volume: z.string().optional(),
    requerente: z.string(),
    assunto: z.string(),
    outro_assunto: z.string(),
    observacao: z.string().optional(),
  })
  .refine(
    (data) => data.assunto === "Outro" && data.outro_assunto.trim().length > 0,
    { message: "É necessário descrever o assunto." }
  );

const EditCapa = ({ capa, assuntos }: EditCapaProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(
    notificationInitialState
  );

  const formInitialState = {
    requerente: capa.requerente,
    num_protocolo: capa.num_protocolo,
    distribuicao: capa.distribuicao.toISOString().split("T")[0],
    volume: capa.volume,
    assunto: assuntos.some((assunto) => assunto.name === capa.assunto)
      ? capa.assunto
      : "Outro",
    outro_assunto: !assuntos.some((assunto) => assunto.name === capa.assunto)
      ? capa.assunto
      : "",
    observacao: capa.observacao,
  };
  const [form, setForm] =
    useState<z.infer<typeof editCapaFormSchema>>(formInitialState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      const result = editCapaFormSchema.safeParse(form);
      if (result.success) {
        const submitter = document.activeElement as HTMLButtonElement;
        setNotification(notificationInitialState);
        setIsLoading(true);

        const response = await fetch(`/api/capas/${capa.id}/update`, {
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

        const { message, updatedCapa }: UpdateCapaResponse =
          await response.json();

        setNotification({ type: "success", message });
        setForm({
          requerente: updatedCapa.requerente,
          num_protocolo: updatedCapa.num_protocolo,
          distribuicao: new Date(updatedCapa.distribuicao)
            .toISOString()
            .split("T")[0],
          volume: updatedCapa.volume,
          assunto: assuntos.some(
            (assunto) => assunto.name === updatedCapa.assunto
          )
            ? updatedCapa.assunto
            : "Outro",
          outro_assunto: !assuntos.some(
            (assunto) => assunto.name === updatedCapa.assunto
          )
            ? updatedCapa.assunto
            : "",
          observacao: updatedCapa.observacao,
        });
        setIsLoading(false);

        if (submitter.value === "PRINT") {
          // print capa
        }
      }
    } catch (error) {
      setNotification({
        message: error.message,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  return (
    <>
      <Head>
        <title>Editar Capa</title>
      </Head>
      <div className="m-auto flex w-full flex-col items-center rounded-[12px] bg-light-500 text-light-50 shadow shadow-black/20 dark:bg-dark-500 dark:text-dark-50 sm:w-[25rem] md:w-[30rem] lg:w-[38rem]">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center">
          <h2 className="text-2xl font-light text-white">Editar Capa</h2>
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
              <div className="flex flex-col">
                <label htmlFor="num_protocolo">N° do Protocolo: *</label>
                <input
                  id="num_protocolo"
                  type="text"
                  onChange={handleChange}
                  value={form.num_protocolo}
                  name="num_protocolo"
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="11/111/11"
                  required={true}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="distribuicao">Distribuição: *</label>
                <input
                  id="distribuicao"
                  type="date"
                  value={form.distribuicao}
                  onChange={handleChange}
                  name="distribuicao"
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Data de distribuição"
                  required={true}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="volume">Volume:</label>
                <input
                  id="volume"
                  type="text"
                  onChange={handleChange}
                  name="volume"
                  value={form.volume}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Campo Opcional"
                  required={false}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="requerente">Requerente: *</label>
                <input
                  id="requerente"
                  type="text"
                  onChange={handleChange}
                  name="requerente"
                  value={form.requerente}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Arthur de Oliveira"
                  required={true}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="assunto">Assunto: *</label>
                <select
                  id="assunto"
                  onChange={handleChange}
                  name="assunto"
                  value={form.assunto}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Selecione o Assunto"
                  required={true}
                >
                  <option value="">Selecione o Assunto</option>
                  {assuntos.map((assunto) => (
                    <option value={assunto.name} key={assunto.name}>
                      {assunto.name}
                    </option>
                  ))}
                  <option value="Outro">Outro</option>
                </select>
              </div>
              {form.assunto === "Outro" && (
                <div className="flex flex-col">
                  <label htmlFor="assunto">Descreva o Assunto: *</label>
                  <input
                    id="outro_assunto"
                    type="text"
                    onChange={handleChange}
                    name="outro_assunto"
                    value={form.outro_assunto}
                    className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                    placeholder="Descreva o assunto."
                    required={true}
                  />
                </div>
              )}
              <div className="flex flex-col">
                <label htmlFor="observacao">Observação:</label>
                <input
                  id="observacao"
                  type="text"
                  onChange={handleChange}
                  name="observacao"
                  value={form.observacao}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Campo Opcional"
                  required={false}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <button
              title="Salvar a capa sem imprimir."
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
              title="Salvar e imprimir a capa."
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

export const getServerSideProps: GetServerSideProps<EditCapaProps> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    };
  }

  /* if (session.user.role !== "SUPERADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  } */

  const id = +context.params.id;
  const capa = await prisma.capa.findFirst({
    where: { id },
    include: {
      creator: true,
      editor: true,
    },
  });

  if (!capa) {
    const queryParams =
      "?notificationMessage=O%20capa%20n%C3%A3o%20foi%20encontrado.&notificationType=error";

    return {
      redirect: {
        permanent: false,
        destination: `/${queryParams}`,
      },
      props: {},
    };
  }

  const assuntos = await prisma.assunto.findMany({
    where: { deleted_at: null },
  });

  return {
    props: {
      assuntos,
      capa,
    },
  };
};

EditCapa.layout = "dashboard";
export default EditCapa;
