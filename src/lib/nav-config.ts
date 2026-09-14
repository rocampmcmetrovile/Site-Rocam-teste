import { Rank } from "@/generated/prisma";
import {
  LayoutDashboard,
  Users,
  Lock,
  Shirt,
  ClipboardCheck,
  CalendarOff,
  Award,
  Settings,
  FileSearch,
  History,
  Crown,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Minimum rank required to see this item, or "staff" for Staff-only. */
  requires?: Rank | "staff";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "efetivo", href: "/dashboard/efetivo", label: "Hierarquia & Efetivo", icon: Users },
  { id: "prisionais", href: "/dashboard/prisionais", label: "Prisões com Sucesso", icon: Lock },
  { id: "fardamentos", href: "/dashboard/fardamentos", label: "Fardamentos ROCAM", icon: Shirt },
  { id: "avaliacoes", href: "/dashboard/avaliacoes", label: "Relatórios de Probatórios", icon: ClipboardCheck },
  { id: "ausencias", href: "/dashboard/ausencias", label: "Registro de Ausência", icon: CalendarOff },
  { id: "promocoes", href: "/dashboard/promocoes", label: "Promoções & Punições", icon: Award },
  {
    id: "configuracoes",
    href: "/dashboard/configuracoes",
    label: "Configurar Perguntas",
    icon: Settings,
    requires: Rank.SUPERVISOR,
  },
  {
    id: "detalhes-avaliacoes",
    href: "/dashboard/detalhes-avaliacoes",
    label: "Dossiê de Avaliações",
    icon: FileSearch,
    requires: Rank.SUPERVISOR,
  },
  {
    id: "alteracoes",
    href: "/dashboard/alteracoes",
    label: "Histórico de Alterações",
    icon: History,
    requires: Rank.SUPERVISOR,
  },
  {
    id: "staff-panel",
    href: "/dashboard/staff-panel",
    label: "Painel Staff & Coordenação",
    icon: Crown,
    requires: "staff",
  },
];
