"use client";

import { signIn } from "next-auth/react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const ROCAM_LOGO = "/rocam-logo.png";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Acesso negado. Você não é membro do servidor ROCAM Metroville no Discord, ou seu cargo ainda não foi configurado no sistema. Contate a Staff.",
  Configuration:
    "Erro de configuração do servidor. Contate a Staff/administração técnica.",
  Default: "Não foi possível concluir o login com Discord. Tente novamente.",
};

export function LoginCard({ error }: { error?: string }) {
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default : null;

  return (
    <div className="relative z-10 w-full max-w-md bg-rocam-card border border-rocam-border rounded-3xl p-8 shadow-2xl text-center space-y-6 glow-yellow">
      <div className="relative w-28 h-28 mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ROCAM_LOGO}
          alt="ROCAM Logo"
          className="w-full h-full rounded-full object-cover border-4 border-rocam-yellow shadow-xl"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/150x150/1e222d/ffbe00?text=ROCAM";
          }}
        />
        <div className="absolute -bottom-1 -right-1 bg-rocam-discord p-2 rounded-full border-2 border-rocam-card text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-extrabold text-rocam-yellow tracking-widest uppercase bg-rocam-yellow/10 px-3 py-1 rounded-full border border-rocam-yellow/30">
          SISTEMA RESTRITO • POLÍCIA MILITAR
        </span>
        <h1 className="font-oswald text-3xl font-bold tracking-wider text-slate-100 uppercase mt-3">
          PAINEL ROCAM METROVILLE
        </h1>
        <p className="text-xs text-rocam-muted">
          Para acessar o sistema de controle e relatórios, faça login
          obrigatório com sua conta do Discord.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 text-left bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          className="w-full py-3.5 px-4 bg-rocam-discord hover:bg-rocam-discordHover text-white font-bold rounded-xl transition-all shadow-lg glow-discord flex items-center justify-center gap-3 text-sm cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Entrar com Discord
        </button>
        <p className="text-[10px] text-rocam-muted">
          Seu cargo dentro do sistema é sincronizado automaticamente com seus
          cargos no servidor Discord da ROCAM Metroville.
        </p>
      </div>
    </div>
  );
}
