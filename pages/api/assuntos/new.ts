import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../db";
import { Assunto, User } from "@prisma/client";

interface NewProtocoloResponse {
  message: string;
  assunto?: Assunto & {
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
      const { name } = req.body;

      const checkExistingAssunto = await prisma.assunto.findFirst({
        where: {
          name: name.toUpperCase().trim(),
        },
      });

      if (checkExistingAssunto)
        return res
          .status(400)
          .json({ message: "Um assunto com o mesmo nome já existe." });

      const assunto = await prisma.assunto.create({
        data: {
          name: name.toUpperCase().trim(),
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
        message: "Assunto registrado com sucesso.",
        assunto,
      });
    } else {
      return res.status(401).json({ message: "Usuário não está autenticado." });
    }
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro na criação do assunto." });
  }
}
