import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";
import { Protocolo, User } from "@prisma/client";

interface NewProtocoloResponse {
  message: string;
  protocolo?: Protocolo & {
    user: User;
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
        num_processo,
        assunto,
        anos_analise,
        nome,
        cpf,
        telefone,
        enviar_whatsapp,
      } = req.body;

      const protocolo = await prisma.protocolo.create({
        data: {
          num_inscricao: String(num_inscricao).toUpperCase(),
          num_processo: String(num_processo).toUpperCase(),
          assunto: String(assunto).toUpperCase(),
          anos_analise: String(anos_analise).toUpperCase(),
          nome: String(nome).toUpperCase(),
          cpf: String(cpf).toUpperCase(),
          telefone: String(telefone),
          enviar_whatsapp: enviar_whatsapp && telefone ? true : false,
          user: {
            connect: { id: +session.user.id },
          },
        },
        include: {
          user: true,
        },
      });

      if (protocolo.enviar_whatsapp) {
        try {
          const protocoloInfo = {
            inscricao: protocolo.num_inscricao ? protocolo.num_inscricao : "Não se aplica",
            processo: protocolo.num_processo,
            assunto: protocolo.assunto,
            analise: protocolo.anos_analise ? protocolo.anos_analise : "Não se aplica",
            nome: protocolo.nome,
            cpf: protocolo.cpf.replaceAll(".", "").replaceAll("-", ""),
            whatsapp: protocolo.telefone.replaceAll("-", ""),
            data: protocolo.created_at.toLocaleDateString("pt-BR"),
          };
          console.log(protocoloInfo);

          const res = await fetch(process.env.WHATSAPP_API_URL, {
            method: "POST",
            body: JSON.stringify(protocoloInfo),
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.WHATSAPP_API_KEY,
            },
          });

          if (res.ok) {
            await prisma.protocolo.update({
              where: {
                id: protocolo.id,
              },
              data: {
                whatsapp_enviado: true,
              },
            });

            const data = await res.json();
            console.log(data);
          }
        } catch (error) {
          console.error(error);
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
    return res.status(500).json({ message: "There was an error." });
  }
}
