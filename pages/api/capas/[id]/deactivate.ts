import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

import { prisma } from "../../../../db";

import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types/interfaces";

export default async function deactivateCapaHandler(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed." });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Usuário não está autenticado" });
    }
    if (session.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Permissão negada." });
    }

    const { id } = req.query;
    if (typeof id === "object")
      return res.status(400).json({ message: "Capa inválida." });

    const capa = await prisma.capa.findFirst({ where: { id: +id } });

    await prisma.capa.update({
      where: { id: +id },
      data: {
        deleted_at: capa.deleted_at ? null : new Date(),
      },
    });

    res.json({ message: "Capa modificada com sucesso." });
  } catch (error) {
    console.log(`Capa Deactivate: ${error}`);
    return res.status(500).json({ message: "Ocorreu um erro." });
  }
}
