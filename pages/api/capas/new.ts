import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";
import { Capa, User } from "@prisma/client";

interface NewProtocoloResponse {
  message: string;
  capa?: Capa & {
    creator: Pick<User, "id" | "name">;
    editor?: Pick<User, "id" | "name">;
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
        num_protocolo,
        distribuicao,
        requerente,
        assunto,
        outro_assunto,
        volume,
        observacao,
      } = req.body;

      const capa = await prisma.capa.create({
        data: {
          num_protocolo: String(num_protocolo).toUpperCase(),
          distribuicao: new Date(`${distribuicao} 00:00:00`),
          assunto:
            assunto === "Outro"
              ? String(outro_assunto).toUpperCase()
              : String(assunto).toUpperCase(),
          requerente: String(requerente).toUpperCase(),
          observacao: observacao ? String(observacao).toUpperCase() : "",
          volume: volume ? String(volume).toUpperCase() : "",
          creator: {
            connect: { id: +session.user.id },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: "Capa registrada com sucesso.",
        capa,
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
