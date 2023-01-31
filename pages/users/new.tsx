import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

import { prisma } from '@/db';
import { Role } from '@prisma/client';
import { UserInfo } from '@/types/interfaces';

import { AppNotification } from '@/types/interfaces';
import React, { useState } from 'react';

interface UserCreateProps {
  user: UserInfo
}

const UserCreate = ({user}: UserCreateProps) => {
  const notificationInitialState: AppNotification = { message: "", type: "" };
  const [notification, setNotification] = useState<AppNotification>(notificationInitialState)
  const formInitalState = {
    name: "",
    email: "",
    role: ""
  }

  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: string;
  }>(formInitalState);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    console.log(form);

    try {
      if (Object.values(form).every(entry => entry.trim().length > 0)) {
        setNotification(notificationInitialState);
        const response = await fetch('/api/user/register', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const data = await response.json();
        setNotification({ type: "success", message: data.message });
        setForm(formInitalState);

      } else {
        setNotification({
          type: "error",
          message: "Preencha as informações."
        });
      }
      
    } catch (error) {
      setNotification({
        message: error.message,
        type: "error"
      });
    }

  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm(st => (
      {...st, [evt.target.name]: evt.target.value }
    ));
  }

  const handleSelect = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(st => ({...st, [evt.target.name]: evt.target.value}));
  }

  return (
    <>
      <Head>
        <title>SGP Dashboard</title>
      </Head>
      <div className="shadow shadow-black/20 w-1/3 m-auto flex flex-col items-center text-white dark:bg-dark-500 bg-light-500 rounded-[12px]">
        <div className="bg-dourado rounded-t-[12px] w-full text-center py-1">
          <h2 className="text-2xl font-light">Novo Usuário</h2>
        </div>
        <form className="flex flex-col gap-8 p-4 w-full pt-8" onSubmit={handleSubmit}>
          {notification.message &&
            <div className={`px-3 py-1 rounded-[8px] text-center flex items-center w-full ${notification.type === "error" ? "bg-red-300 text-red-800" : "bg-green-300 text-green-800"}`}>
              <p className="mx-auto">{notification.message}</p>
              <span className="cursor-pointer hover:text-white" onClick={() => setNotification(notificationInitialState)}>X</span>
            </div>
          }
          <div className="flex flex-col gap-6 px-1">
            <input type="text" onChange={handleChange} name="name" value={form.name} className="px-2 bg-transparent border-b border-zinc-500 pb-1 outline-none" placeholder="Nome Completo" />
            <input type="email" onChange={handleChange} name="email" value={form.email} className="px-2 bg-transparent border-b border-zinc-500 pb-1 outline-none" placeholder="E-mail" />
            <select onChange={handleSelect} name="role" value={form.role} className="text-light-50 bg-light-500 dark:bg-dark-500 dark:text-dark-50 rounded py-1 px-2 bg-transparent border-b border-zinc-500 pb-1 outline-none" placeholder="Confirmar Nova Senha">
              <option value="" className=''>Nível do Usuário</option>
              { Object.values(Role).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
          <button className="text-xl bg-roxo rounded-[10px] p-1 hover:bg-indigo-500 font-light">Criar</button>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<UserCreateProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login"
      },
      props: {}
    }
  } else {
    const authUser = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      }
    });

    return {
      props: {
        user: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          is_enabled: authUser.is_enabled
        }
      }
    }
  }
}

UserCreate.layout = "dashboard";
export default UserCreate;