import { Button } from "@/components/ui/button";
import { Building2, Phone, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: Users,
      label: "Lead Management",
      desc: "Track every lead through your pipeline",
    },
    {
      icon: Phone,
      label: "Call Logging",
      desc: "Log calls and outcomes instantly",
    },
    {
      icon: TrendingUp,
      label: "Pipeline Analytics",
      desc: "Real-time KPIs and dashboard stats",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 text-white"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.34 0.07 206) 0%, oklch(0.25 0.055 206) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">LoanCall CRM</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Close more loans,
              <br />
              faster than ever.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Manage your entire sales pipeline—from first contact to funded—in
              one powerful workspace built for loan originators.
            </p>
          </div>

          <div className="space-y-5">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.45 }}
                className="flex items-start gap-4"
              >
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-white/60 text-sm mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} LoanCall CRM. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">LoanCall CRM</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your sales dashboard
            </p>
          </div>

          <Button
            data-ocid="login.primary_button"
            className="w-full h-12 text-base font-semibold"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Connecting..." : "Sign in with Internet Identity"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure, decentralized authentication powered by the Internet
            Computer.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
