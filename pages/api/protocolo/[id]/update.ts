import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";
import { Protocolo, User } from "@prisma/client";
import { sendWhatsApp } from "../send-whatsapp";

interface UpdateProtocoloResponse {
  message: string;
  updatedProtocolo?: Protocolo & {
    creator: User;
    editor?: User;
  };
}

export default async function NewProtocolo(
  req: NextApiRequest,
  res: NextApiResponse<UpdateProtocoloResponse>
) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ message: `${req.method} method is not allowed.` });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Usuário não está autenticado." });
    }
    
    if (session.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Permissão negada." });
    }

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

    const id = +req.query.id;

    const updatedProtocolo = await prisma.protocolo.update({
      where: {
        id
      },
      data: {
        num_inscricao: String(num_inscricao).toUpperCase(),
        assunto: String(assunto).toUpperCase(),
        anos_analise: String(anos_analise).toUpperCase(),
        nome: String(nome).toUpperCase(),
        cpf: cpf ? String(cpf).toUpperCase() : "",
        cnpj: cnpj ? String(cnpj).toUpperCase() : "",
        telefone: String(telefone),
        enviar_whatsapp: enviar_whatsapp && telefone ? true : false,
        editor: {
          connect: { id: +session.user.id }
        }
      },
      include: {
        creator: true,
      },
    });

    if (updatedProtocolo.enviar_whatsapp) {
      try {
        sendWhatsApp(updatedProtocolo);
      } catch (error) {
        console.log(error);
      }
    }

    return res.status(200).json({
      message: "Protocolo modificado com sucesso.",
      updatedProtocolo,
    });
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro na edição o protocolo." });
  }
}
