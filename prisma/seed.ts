import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  const newAdmin = await prisma.user.upsert({
    where: { email: "felipe.vidal@mesquita.rj.gov.br" },
    update: {},
    create: {
      email: "felipe.vidal@mesquita.rj.gov.br",
      name: "Felipe Vidal",
      password: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
      role: "SUPERADMIN",
      updated_at: null,
    },
  });

  const assuntos = [
    "PAGAMENTO",
    "ALTERAÇÃO DE NOME",
    "PRESCRIÇÃO DE DÉBITO",
    "RENOVAÇÃO DE ISENÇÃO DE IPTU",
    "BAIXA DE DÉBITO",
    "SOLICITAÇÃO DE PROVIDÊNCIAS",
    "AUTO DE NOTIFICAÇÃO",
    "ISENÇÃO DE IPTU",
    "PAGAMENTO DE ALUGUEL",
    "RENOVAÇÃO DE INSPEÇÃO SANITÁRIA",
    "PAGAMENTO LIGHT",
    "PAGAMENTO NET",
    "PAGAMENTO ÁGUAS DO RIO",
    "LICENÇA PRÊMIO",
    "CADASTRO DE IPTU",
    "PARCELAMENTO COM VALORES BLOQUEADOS",
    "ATUALIZAÇÃO CADASTRAL",
    "BAIXA DE ALVARÁ",
    "NADA A OPOR",
    "LEGALIZAÇÃO DE PUBLICIDADE",
    "ENQUADRAMENTO POR FORMAÇÃO",
    "BAIXA DE TAXA INDEVIDA",
  ];
  assuntos.sort().map(async (assunto) => {
    await prisma.assunto.upsert({
      where: { name: assunto },
      update: {},
      create: {
        name: assunto,
        creator: {
          connect: {
            id: newAdmin.id,
          },
        },
      },
    });
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
