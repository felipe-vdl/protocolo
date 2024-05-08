import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

import { prisma } from "../../../../db";

import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types/interfaces";
import { Capa } from "@prisma/client";

export default async function getCapaByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ capa: Capa } | Message>
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
      return res.status(400).json({ message: "Capa inválida." });

    const capa = await prisma.capa.findFirst({
      where: { id: +id, deleted_at: null },
      include: { creator: true, editor: true },
    });

    if (!capa) return res.status(404).json({ message: "Capa não encontrada." });

    res.status(200).json({ capa });
  } catch (error) {
    console.log(`Capa Deactivate: ${error}`);
    return res.status(500).json({ message: "Ocorreu um erro." });
  }
}
