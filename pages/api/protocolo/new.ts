import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";
import { Protocolo, User } from "@prisma/client";
import { sendWhatsApp } from "./send-whatsapp";

interface NewProtocoloResponse {
  message: string;
  protocolo?: Protocolo & {
    creator: User;
    editor?: User;
  };
}

export default async function NewProtocolo(
  req: NextApiRequest,
  res: NextApiResponse<NewProtocoloResponse>
) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ message: `${req.method} method is not allowed.` });
    }

    const session = await getServerSession(req, res, authOptions);
    if (session) {
      const {
        num_inscricao,
        assunto,
        anos_analise,
        nome,
        cpf,
        cnpj,
        telefone,
        enviar_whatsapp,
      } = req.body;

      // Algoritmo de formação do 'processo'.
      const lastProtocolo = await prisma.protocolo.findMany({
        orderBy: {
          id: "desc",
        },
        take: 1,
      });

      const dateNow = new Date();
      const ano = `${dateNow.getFullYear()}`.slice(2);
      const mes = dateNow.getMonth() + 1;

      let num_processo: number;

      if (lastProtocolo.length) {
        if (+lastProtocolo[0].processo.split("/")[2] < +ano) {
          // If the last record's year is less then the current date's year, restart the count from 1.
          num_processo = 1;
        } else {
          // If we're still in the same year, increment the counter.
          num_processo = lastProtocolo[0].num_processo+1;
        }
      } else {
        // First register.
        num_processo = 1;
      }

      const processo = `${mes}/${num_processo}/${ano}`;

      const protocolo = await prisma.protocolo.create({
        data: {
          num_inscricao: String(num_inscricao).toUpperCase(),
          num_processo,
          processo,
          assunto: String(assunto).toUpperCase(),
          anos_analise: String(anos_analise).toUpperCase(),
          nome: String(nome).toUpperCase(),
          cpf: cpf ? String(cpf).toUpperCase() : "",
          cnpj: cnpj ? String(cnpj).toUpperCase() : "",
          telefone: String(telefone),
          enviar_whatsapp: enviar_whatsapp && telefone ? true : false,
          creator: {
            connect: { id: +session.user.id },
          }
        },
        include: {
          creator: true,
        },
      });

      if (protocolo.enviar_whatsapp) {
        try {
          sendWhatsApp(protocolo);
        } catch (error) {
          console.log(error);
        }
      }

      return res.status(200).json({
        message: "Protocolo registrado com sucesso.",
        protocolo,
      });
    } else {
      return res.status(401).json({ message: "Usuário não está autenticado." });
    }
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro na criação o protocolo." });
  }
}
