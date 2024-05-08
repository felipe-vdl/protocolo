import Head from "next/head";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { Assunto, Capa, User } from "@prisma/client";

import React, { useState } from "react";
import { AppNotification } from "@/types/interfaces";
import InputMask from "react-input-mask";
import z from "zod";
import { prisma } from "@/db";

interface NewCapaResponse {
  message: string;
  capa?: Capa & {
    creator: User;
    editor?: User;
  };
}

const capaFormSchema = z
  .object({
    num_protocolo: z.string(),
    distribuicao: z.string().datetime(),
    volume: z.string().optional(),
    assunto: z.string(),
    outro_assunto: z.string(),
    observacao: z.string().optional(),
  })
  .refine(
    (data) =>
      data.assunto === "Outro" && data.outro_assunto.trim().length === 0,
    { message: "É necessário descrever o assunto." }
  );

type CapaCreateProps = {
  assuntos: Assunto[];
};

const CapaCreate = ({ assuntos }: CapaCreateProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(
    notificationInitialState
  );

  const formInitialState = {
    num_protocolo: "",
    distribuicao: "",
    volume: "",
    assunto: "",
    outro_assunto: "",
    observacao: "",
  };
  const [form, setForm] =
    useState<z.infer<typeof capaFormSchema>>(formInitialState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      const result = capaFormSchema.safeParse(form);
      if (result.success) {
        const submitter = document.activeElement as HTMLButtonElement;
        setNotification(notificationInitialState);
        setIsLoading(true);
        const response = await fetch("/api/capas/new", {
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

        const { message, capa }: NewCapaResponse = await response.json();
        setNotification({ type: "success", message });
        setForm(formInitialState);
        setIsLoading(false);

        if (submitter.value === "PRINT") {
          // print capa
        }
      } else if (result.success === false) {
        const { errors } = result.error;

        setNotification({
          type: "error",
          message: `${errors.map((err) => err.message).join(", ")}.`,
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

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  return (
    <>
      <Head>
        <title>Nova Capa</title>
      </Head>
      <div className="m-auto flex w-full flex-col items-center rounded-[12px] bg-light-500 text-light-50 shadow shadow-black/20 dark:bg-dark-500 dark:text-dark-50 sm:w-[25rem] md:w-[30rem] lg:w-[38rem]">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center">
          <h2 className="text-2xl font-light text-white">Nova Capa</h2>
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
                <label htmlFor="num_protocolo">N° do Protocolo:</label>
                <input
                  id="num_protocolo"
                  type="text"
                  onChange={handleChange}
                  name="num_protocolo"
                  value={form.num_protocolo}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="__/___/__"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="distribuicao">Distribuição:</label>
                <input
                  id="distribuicao"
                  type="text"
                  onChange={handleChange}
                  name="distribuicao"
                  value={form.distribuicao}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Data de distribuição"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="assunto">Assunto:</label>
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
              <div className="flex flex-col">
                <label htmlFor="assunto">Descreva o Assunto:</label>
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
              <div className="flex flex-col">
                <label htmlFor="anos_analise">Anos p/ Análise:</label>
                <input
                  id="anos_analise"
                  type="text"
                  onChange={handleChange}
                  name="anos_analise"
                  value={form.anos_analise}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder="Campo opcional"
                  required={false}
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 px-1">
              <div className="flex w-full items-center">
                <div className="flex flex-1 items-center justify-center gap-2">
                  <input
                    onChange={handleRadioChange}
                    type="radio"
                    id="cpf"
                    name="tipo"
                    value="cpf"
                    checked={isCPF}
                  />
                  <label htmlFor="cpf">CPF</label>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2">
                  <input
                    onChange={handleRadioChange}
                    type="radio"
                    id="cnpj"
                    name="tipo"
                    value="cnpj"
                    checked={!isCPF}
                  />
                  <label htmlFor="cnpj">CNPJ</label>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="nome">
                  {isCPF ? "Nome:" : "Razão Social:"}
                </label>
                <input
                  id="nome"
                  type="text"
                  onChange={handleChange}
                  name="nome"
                  value={form.nome}
                  className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                  placeholder={isCPF ? "Nome Completo" : "Razão Social"}
                  required={true}
                />
              </div>
              {isCPF ? (
                <>
                  <div className="flex flex-col">
                    <label htmlFor="cpf">CPF:</label>
                    <InputMask
                      id="cpf"
                      required
                      className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                      mask="999.999.999-99"
                      maskChar={null}
                      placeholder="111.111.111-11"
                      value={form.cpf}
                      name="cpf"
                      minLength={14}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="ddd">Telefone Celular:</label>
                    <div className="flex">
                      <InputMask
                        id="ddd"
                        value={form.ddd}
                        onChange={handleDDDChange}
                        name="ddd"
                        placeholder="DDD"
                        maskChar={null}
                        mask="99"
                        max={2}
                        required={form.telefone.length > 0}
                        className="w-[4rem] border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                      />
                      <InputMask
                        id="telefone"
                        required={form.telefone.length > 0}
                        minLength={14}
                        maskChar={null}
                        className="flex-1 border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                        placeholder="Telefone Celular (WhatsApp)"
                        mask="9999-99999"
                        value={form.telefone}
                        name="telefone"
                        onChange={handleTelefoneChange}
                        onKeyDown={handleTelefoneKeyboard}
                      />
                    </div>
                  </div>
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
                </>
              ) : (
                <div className="flex flex-col">
                  <label htmlFor="cnpj">CNPJ:</label>
                  <InputMask
                    id="cnpj"
                    required
                    className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                    mask="99.999.999/9999-99"
                    maskChar={null}
                    placeholder="11.111.111/1111-11"
                    value={form.cnpj}
                    name="cnpj"
                    minLength={18}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-8">
            {isCPF && (
              <button
                title="Salvar o capa sem imprimir."
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
            )}
            <button
              title="Salvar e imprimir o capa."
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
    const assuntos = await prisma.capa.findMany({
      where: { deleted_at: null },
    });

    return {
      props: {
        assuntos,
      },
    };
  }
};

CapaCreate.layout = "dashboard";
export default CapaCreate;
