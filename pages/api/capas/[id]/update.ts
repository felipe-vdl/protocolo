import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";
import { Capa, User } from "@prisma/client";

interface UpdateCapaResponse {
  message: string;
  updatedCapa?: Capa & {
    creator: Pick<User, "id" | "name">;
    editor?: Pick<User, "id" | "name">;
  };
}

export default async function NewCapa(
  req: NextApiRequest,
  res: NextApiResponse<UpdateCapaResponse>
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

    const {
      num_protocolo,
      distribuicao,
      requerente,
      assunto,
      outro_assunto,
      volume,
      observacao,
    } = req.body;

    const id = +req.query.id;

    const updatedCapa = await prisma.capa.update({
      where: {
        id,
      },
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
        editor: {
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
      message: "Capa modificada com sucesso.",
      updatedCapa,
    });
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro na edição da capa." });
  }
}
