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
      const { num_inscricao, num_processo, nome, assunto, anos_analise } =
        req.body;

      const newProtocolo = await prisma.protocolo.create({
        data: {
          num_inscricao: String(num_inscricao).toUpperCase(),
          num_processo: String(num_processo).toUpperCase(),
          nome: String(nome).toUpperCase(),
          assunto: String(assunto).toUpperCase(),
          anos_analise: String(anos_analise).toUpperCase(),
          user: {
            connect: { id: +session.user.id },
          },
        },
        include: {
          user: true,
        },
      });

      return res.status(200).json({
        message: "Usuário criado com sucesso.",
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
