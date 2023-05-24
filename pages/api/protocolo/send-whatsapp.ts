import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";

import { Message } from "@/types/interfaces";

export default async function SendWhatsApp(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ message: `${req.method} method is not allowed.` });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Usuário não está autenticado" });
    }

    const { id } = req.body;
    const protocolo = await prisma.protocolo.findUnique({ where: { id } });

    if (!protocolo.telefone) {
      return res.status(400).json({
        message: "O registro não contém telefone.",
      });
    }

    try {
      const res = await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        body: JSON.stringify({
          inscricao: protocolo.num_inscricao ?? "Não se aplica",
          processo: protocolo.num_processo,
          assunto: protocolo.assunto,
          analise: protocolo.anos_analise ?? "Não se aplica",
          nome: protocolo.nome,
          cpf: protocolo.cpf.replace(".", "").replace("-", ""),
          whatsapp: protocolo.telefone.replace("-", ""),
          data: protocolo.created_at.toLocaleDateString("pt-BR"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const updatedProtocolo = await prisma.protocolo.update({
          where: { id },
          data: {
            whatsapp_enviado: true,
          },
        });
        const data = await res.json();
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
    
    return res.json({
      message: "Notificação enviada com sucesso.",
    });
  } catch (error) {
    console.error(`Send WhatsApp Error: ${error}`);
    return res.status(500).json({ message: "Ocorreu um erro." });
  }
}