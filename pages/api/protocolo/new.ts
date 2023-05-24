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
      const { num_inscricao, num_processo, assunto, anos_analise, nome, cpf, telefone, enviar_whatsapp } =
        req.body;

      const newProtocolo = await prisma.protocolo.create({
        data: {
          num_inscricao: String(num_inscricao).toUpperCase(),
          num_processo: String(num_processo).toUpperCase(),
          assunto: String(assunto).toUpperCase(),
          anos_analise: String(anos_analise).toUpperCase(),
          nome: String(nome).toUpperCase(),
          cpf: String(cpf).toUpperCase(),
          telefone: String(telefone),
          enviar_whatsapp: (enviar_whatsapp && telefone) ? true : false,
          user: {
            connect: { id: +session.user.id },
          },
        },
        include: {
          user: true,
        },
      });

      if (newProtocolo.enviar_whatsapp) {
        try {
          const res = await fetch(process.env.WHATSAPP_API_URL, {
            method: "POST",
            body: JSON.stringify({
              inscricao: newProtocolo.num_inscricao ?? "Não se aplica",
              processo: newProtocolo.num_processo,
              assunto: newProtocolo.assunto,
              analise: newProtocolo.anos_analise ?? "Não se aplica",
              nome: newProtocolo.nome,
              cpf: newProtocolo.cpf.replace(".", "").replace("-", ""),
              whatsapp: newProtocolo.telefone.replace("-", ""),
              data: newProtocolo.created_at.toLocaleDateString("pt-BR")
            }),
            headers: {
              "Content-Type": "application/json",
            }
          });
  
          if (res.ok) {
            const updatedProtocolo = await prisma.protocolo.update({
              where: {
                id: newProtocolo.id,
              },
              data: {
                whatsapp_enviado: true,
              }
            });

            const data = await res.json();
            console.log(data);
          }
        } catch (error) {
          console.log(error);
        }
      }

      return res.status(200).json({
        message: "Protocolo registrado com sucesso.",
        protocolo: newProtocolo,
      });
    } else {
      return res.status(401).json({ message: "Usuário não está autenticado." });
    }
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res.status(500).json({ message: "There was an error." });
  }
}
