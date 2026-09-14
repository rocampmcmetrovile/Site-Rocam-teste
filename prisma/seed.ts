import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEFAULT_UNIFORMS = [
  {
    title: "Uniforme Probatório",
    badge: "PROBATÓRIO",
    imageUrl: "https://placehold.co/300x500/1e222d/ffbe00?text=PROBATORIO",
    details:
      "LOJA POLICIAL\n• Jaqueta: 759 - 1\n• Braço: 223 - 2\n• Calça: 298 - 2\n• Colete: 95\n• Acessório: 298\n\nLOJA NORMAL\n• Chapéu: 62 - 9",
    order: 0,
  },
  {
    title: "Uniforme Probatório (VIP)",
    badge: "PROBATÓRIO VIP",
    imageUrl: "https://placehold.co/300x500/1e222d/ffbe00?text=PROBATORIO+VIP",
    details:
      "LOJA VIP\n• Jaqueta: 763 - 1\n• Braços: 228 - 10\n• Calça: 300 - 6\n• Sapatos: 223 - 4\n\nLOJA POLICIAL / NORMAL\n• Coletes: 95\n• Acessório: 298\n• Chapéu (Normal): 62 - 9",
    order: 1,
  },
  {
    title: "Uniforme Graduado",
    badge: "GRADUADO",
    imageUrl: "https://placehold.co/300x500/1e222d/ffbe00?text=GRADUADO",
    details:
      "LOJA POLICIAL\n• Jaqueta: 759 - 9\n• Camiseta: - 15\n• Braço: 226 - 2\n• Calça: 298 - 2\n• Sapato: 222 - 2\n• Colete: 96\n• Chapéus: 230\n• Acessório: 298",
    order: 2,
  },
  {
    title: "Uniforme Graduado — VIP (Cinza)",
    badge: "GRADUADO VIP (CINZA)",
    imageUrl: "https://placehold.co/300x500/1e222d/ffbe00?text=GRADUADO+CINZA",
    details:
      "LOJA VIP\n• Jaqueta: 763 - 9\n• Braço: 229 - 3\n\nLOJA POLICIAL NORMAL\n• Calça: 298 - 2\n• Sapato: 222 - 2\n• Colete: 96\n• Chapéu: 230\n• Acessório: 298",
    order: 3,
  },
  {
    title: "Uniforme Graduado — VIP (Camuflado)",
    badge: "GRADUADO VIP (CAMUFLADO)",
    imageUrl:
      "https://placehold.co/300x500/1e222d/ffbe00?text=GRADUADO+CAMUFLADO",
    details:
      "LOJA VIP\n• Jaqueta: 769 - 21\n• Braço: 229 - 3\n• Calça: 300 - 6\n• Chapéu: 237 - 1\n\nLOJA POLICIAL NORMAL\n• Sapato: 222 - 2\n• Colete: 96\n• Acessório: 298",
    order: 4,
  },
  {
    title: "Uniforme Elite ROCAM",
    badge: "ELITE ROCAM",
    imageUrl: "https://live.staticflickr.com/65535/55516633515_cb7f447846_m.jpg",
    details:
      "ESPECIFICAÇÃO DE ELITE\n• Fardamento exclusivo dos membros do grupamento Elite ROCAM.\n• Acessórios táticos avançados e capacete camuflado.",
    order: 5,
  },
];

const DEFAULT_QUESTIONS = [
  "Postura e Conduta Profissional durante a PTR",
  "Domínio do Código Q e Comunicação via Rádio",
  "Pilotagem Tática da Motocicleta e Manobras",
  "Agilidade e Eficiência nas Abordagens / Prisões",
  "Conhecimento do Código Penal de Metroville",
];

const DEFAULT_STAFF_MEMBERS = [
  {
    name: "Gabriel Silva",
    passport: "1001",
    discordHandle: "@gabriel_staff",
    cargo: "Dono / Fundador",
  },
  {
    name: "Lucas Santos",
    passport: "18492",
    discordHandle: "@corvo_master",
    cargo: "Administrador Master",
  },
];

async function main() {
  console.log("Seeding default ROCAM Metroville data...");

  if ((await prisma.uniform.count()) === 0) {
    await prisma.uniform.createMany({
      data: DEFAULT_UNIFORMS,
    });
    console.log(`  -> ${DEFAULT_UNIFORMS.length} uniformes criados.`);
  }

  if ((await prisma.question.count()) === 0) {
    await prisma.question.createMany({
      data: DEFAULT_QUESTIONS.map((text, order) => ({ text, order })),
    });
    console.log(`  -> ${DEFAULT_QUESTIONS.length} perguntas de PTR criadas.`);
  }

  if ((await prisma.staffMember.count()) === 0) {
    await prisma.staffMember.createMany({
      data: DEFAULT_STAFF_MEMBERS,
    });
    console.log(`  -> ${DEFAULT_STAFF_MEMBERS.length} membros de staff criados.`);
  }

  await prisma.activityLog.create({
    data: {
      type: "SISTEMA",
      title: "Painel ROCAM Inicializado",
      detail: "Banco de dados inicializado com dados padrão (seed).",
    },
  });

  console.log("Seed finalizado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
