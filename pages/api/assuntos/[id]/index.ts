import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

import { prisma } from "../../../../db";

import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types/interfaces";
import { Assunto, User } from "@prisma/client";

type GetAssuntoByIDResponse =
  | {
      assunto: Assunto & {
        creator: Pick<User, "id" | "name">;
        editor: Pick<User, "id" | "name">;
      };
    }
  | Message;

export default async function getAssuntoByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetAssuntoByIDResponse>
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed." });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Usuário não está autenticado" });
    }

    const { id } = req.query;
    if (typeof id === "object")
      return res.status(400).json({ message: "Assunto inválida." });

    const assunto = await prisma.assunto.findFirst({
      where: { id: +id, deleted_at: null },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!assunto)
      return res.status(404).json({ message: "Assunto não encontrada." });

    res.status(200).json({ assunto });
  } catch (error) {
    console.log(`Assunto Deactivate: ${error}`);
    return res.status(500).json({ message: "Ocorreu um erro." });
  }
}
