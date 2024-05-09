import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";
import { Assunto, User } from "@prisma/client";

interface UpdateAssuntoResponse {
  message: string;
  updatedAssunto?: Assunto & {
    creator: Pick<User, "id" | "name">;
    editor?: Pick<User, "id" | "name">;
  };
}

export default async function NewAssunto(
  req: NextApiRequest,
  res: NextApiResponse<UpdateAssuntoResponse>
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

    const { name } = req.body;

    const id = +req.query.id;

    const checkExistingAssunto = await prisma.assunto.findFirst({
      where: {
        id: {
          not: {
            equals: id,
          },
        },
        name: name.toUpperCase().trim(),
      },
    });

    if (checkExistingAssunto)
      return res
        .status(400)
        .json({ message: "Um assunto com o mesmo nome já existe." });

    const updatedAssunto = await prisma.assunto.update({
      where: {
        id,
      },
      data: {
        name: name.toUpperCase().trim(),
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
      message: "Assunto modificado com sucesso.",
      updatedAssunto,
    });
  } catch (error) {
    console.error(`Register Error: ${error}`);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro na edição do assunto." });
  }
}
