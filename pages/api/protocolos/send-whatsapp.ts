import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";

import { Message } from "@/types/interfaces";
import { Protocolo } from "@prisma/client";

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
      sendWhatsApp(protocolo);
    } catch (error) {
      console.error(error);
    }

    return res.json({
      message: "Notificação enviada com sucesso.",
    });
  } catch (error) {
    console.error(`Send WhatsApp Error: ${error}`);
    return res.status(500).json({ message: "Ocorreu um erro." });
  }
}

export const sendWhatsApp = async (protocolo: Protocolo) => {
  try {
    const protocoloInfo = {
      inscricao: protocolo.num_inscricao
        ? protocolo.num_inscricao
        : "Não se aplica",
      processo: protocolo.processo,
      assunto: protocolo.assunto,
      analise: protocolo.anos_analise
        ? protocolo.anos_analise
        : "Não se aplica",
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
        Accept: "application/json",
        "x-api-key": process.env.WHATSAPP_API_KEY,
      },
    });

    if (!res.ok) {
      console.log("!ok", res);

      const text = await res.text();
      console.log(text);

      const data = await res.json();
      throw new Error(data);
    }

    const updateProtocolo = await prisma.protocolo.update({
      where: {
        id: protocolo.id,
      },
      data: {
        whatsapp_enviado: true,
      },
    });

    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
};
