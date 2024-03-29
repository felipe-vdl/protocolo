import Head from "next/head";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]";

import { prisma } from "@/db";
import { Role, User } from "@prisma/client";
import { UserInfo } from "@/types/interfaces";

import { AppNotification } from "@/types/interfaces";
import React, { useState } from "react";
import Router from "next/router";

interface UserCreateProps {
  user: UserInfo;
  authUser: User;
}

const UserCreate = ({ user, authUser }: UserCreateProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(
    notificationInitialState
  );
  const formInitalState = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: string;
  }>(formInitalState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      if (Object.values(form).every((entry) => entry.trim().length > 0)) {
        setNotification(notificationInitialState);
        setIsLoading(true);
        const response = await fetch(`/api/users/${user.id}/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            name: form.name,
            email: form.email,
            role: form.role,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const data = await response.json();
        setNotification({ type: "success", message: data.message });
        setForm(data.updatedUser);
        setIsLoading(false);
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

  const handleSelect = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  return (
    <>
      <Head>
        <title>Alterar Usuário</title>
      </Head>
      <div className="m-auto w-full flex-col items-center rounded-[12px] bg-light-500 text-light-50 shadow shadow-black/20 dark:bg-dark-500 dark:text-dark-50 sm:w-[25rem] md:w-[30rem] lg:w-[38rem]">
        <div className="w-full rounded-t-[12px] bg-dourado py-1 text-center text-white">
          <h2 className="text-2xl font-light">Editar Usuário</h2>
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
            <div className="flex flex-col">
              <label htmlFor="name">Nome Completo:</label>
              <input
                id="name"
                type="text"
                onChange={handleChange}
                name="name"
                value={form.name}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Ex.: Arthur de Oliveira"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email">E-mail / Usuário:</label>
              <input
                id="email"
                type="text"
                onChange={handleChange}
                name="email"
                value={form.email}
                className="border-b border-zinc-500 bg-transparent px-2 pb-1 outline-none"
                placeholder="Informe um E-mail ou Usuário"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="role">Nível do Usuário:</label>
              <select
                onChange={handleSelect}
                name="role"
                value={form.role}
                className="rounded border-b border-zinc-500 bg-light-500 bg-transparent py-1 px-2 pb-1 text-light-50 outline-none dark:bg-dark-500 dark:text-dark-50"
                placeholder="Confirmar Nova Senha"
              >
                <option value="" className="">
                  Selecione o nível do usuário
                </option>
                {Object.values(Role).map((val) => (
                  <>
                    {val === "SUPERADMIN" && authUser.role === "SUPERADMIN" ? (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ) : (
                      val !== "SUPERADMIN" && (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      )
                    )}
                  </>
                ))}
              </select>
            </div>
          </div>
          <div className="flex w-full gap-8">
            <button
              disabled={isLoading}
              className="flex-1 rounded-[10px] bg-roxo p-1 text-xl font-light text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isLoading ? "Editando usuário..." : "Editar"}
            </button>
            <button
              onClick={() => Router.replace("/users")}
              className="flex-1 rounded-[10px] bg-zinc-500 p-1 text-center text-xl font-light text-white hover:bg-zinc-400 disabled:bg-indigo-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<UserCreateProps> = async (
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
    const id = +context.params.id;
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });

    const authUser = await prisma.user.findFirst({
      where: {
        id: +session.user.id,
      },
    });
    if (authUser.role === "USER") {
      const queryParams =
        "?notificationMessage=Usu%C3%A1rio%20n%C3%A3o%20tem%20permiss%C3%A3o&notificationType=error";

      return {
        redirect: {
          permanent: false,
          destination: `/${queryParams}`,
        },
        props: {},
      };
    }

    return {
      props: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_enabled: user.is_enabled,
        },
        authUser,
      },
    };
  }
};

UserCreate.layout = "dashboard";
export default UserCreate;
