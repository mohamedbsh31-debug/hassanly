"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "3 000",
    period: "DA/mois",
    badge: null,
    featured: false,
    features: [
      "1 profil coiffeur",
      "Réservation en ligne",
      "Jusqu'à 5 services",
      "Notifications SMS",
    ],
    cta: "Commencer",
  },
  {
    id: "pro",
    name: "Pro",
    price: "6 500",
    period: "DA/mois",
    badge: "Populaire",
    featured: true,
    features: [
      "Jusqu'à 5 coiffeurs",
      "Services illimités",
      "Analytics & rapports",
      "Badge Salon Vérifié",
      "Notifications SMS + WhatsApp",
    ],
    cta: "Choisir Pro",
  },
  {
    id: "elite",
    name: "Elite",
    price: "12 000",
    period: "DA/mois",
    badge: null,
    featured: false,
    features: [
      "Coiffeurs illimités",
      "Multi-adresses",
      "Support prioritaire 24/7",
      "Mise en avant",
      "Programme fidélité",
    ],
    cta: "Choisir Elite",
  },
];

const faqs = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre tableau de bord. Le changement prend effet immédiatement.",
  },
  {
    q: "Y a-t-il une période d'essai gratuite ?",
    a: "Nous offrons 14 jours d'essai gratuit sur tous nos plans. Aucune carte bancaire requise pour commencer.",
  },
  {
    q: "Comment fonctionne la facturation ?",
    a: "La facturation est mensuelle, en dinars algériens (DA). Vous recevez une facture par email chaque mois.",
  },
  {
    q: "Le Badge Salon Vérifié, c'est quoi ?",
    a: "C'est un badge affiché sur votre profil public qui indique aux clients que votre salon a été vérifié par Hassanly — renforçant la confiance et la crédibilité.",
  },
];

const tableRows = [
  { feature: "Profils coiffeurs",        starter: "1",     pro: "5",         elite: "Illimités" },
  { feature: "Services",                 starter: "5 max", pro: "Illimités", elite: "Illimités" },
  { feature: "Réservation en ligne",     starter: true,    pro: true,        elite: true },
  { feature: "Notifications SMS",        starter: true,    pro: true,        elite: true },
  { feature: "Notifications WhatsApp",   starter: false,   pro: true,        elite: true },
  { feature: "Analytics & rapports",     starter: false,   pro: true,        elite: true },
  { feature: "Badge Salon Vérifié",      starter: false,   pro: true,        elite: true },
  { feature: "Multi-adresses",           starter: false,   pro: false,       elite: true },
  { feature: "Mise en avant",            starter: false,   pro: false,       elite: true },
  { feature: "Programme fidélité",       starter: false,   pro: false,       elite: true },
  { feature: "Support prioritaire 24/7", starter: false,   pro: false,       elite: true },
];

function Logo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
      <svg width="26" height="20" viewBox="0 0 28 22" fill="none">
        <path d="M2 14c4-8 8-8 12 0s8 8 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>hass<span style={{ color: "#d97706" }}>anly</span></span>
    </Link>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSelectPlan(planId: string) {
    setLoading(planId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push(`/dashboard?tab=billing&plan=${planId}`);
    } else {
      router.push(`/auth/register?role=barber_owner&plan=${planId}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>

      {/* NAV — matches home page exactly */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", height: 64, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Accueil</Link>
          <Link href="/pricing" style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Pour les coiffeurs</Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Connexion</Link>
          <Link href="/auth/register?role=barber_owner" style={{ borderRadius: 999, background: "var(--foreground)", color: "#fff", padding: "10px 20px", fontSize: 14, fontWeight: 600 }}>
            Inscrire mon salon
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "72px 24px 56px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "inline-block", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "#92400e", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 20 }}>
          Pour les professionnels
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", lineHeight: 1.1, marginBottom: 16 }}>
          Choisissez votre formule
        </h1>
        <p style={{ fontSize: 17, color: "var(--muted-foreground)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          Des outils pensés pour les salons algériens. Simple, puissant, sans contrat.
        </p>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted-foreground)" }}>
          ✓ 14 jours d'essai gratuit &nbsp;·&nbsp; ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Annulez à tout moment
        </p>
      </section>

      {/* PRICING CARDS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} loading={loading === plan.id} />
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ maxWidth: 900, margin: "0 auto 72px", padding: "0 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 24, textAlign: "center" }}>
          Comparaison des formules
        </h2>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fonctionnalité</th>
                <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Starter</th>
                <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 700, color: "#d97706", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fffbeb" }}>Pro ★</th>
                <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Elite</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "var(--muted)" }}>
                  <td style={{ padding: "13px 20px", color: "var(--foreground)", fontSize: 14 }}>{row.feature}</td>
                  <td style={{ padding: "13px 20px", textAlign: "center" }}>{renderCell(row.starter)}</td>
                  <td style={{ padding: "13px 20px", textAlign: "center", background: "#fffbeb" }}>{renderCell(row.pro)}</td>
                  <td style={{ padding: "13px 20px", textAlign: "center" }}>{renderCell(row.elite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 680, margin: "0 auto 72px", padding: "0 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 24, textAlign: "center" }}>
          Questions fréquentes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: "1px solid", borderColor: openFaq === i ? "#d97706" : "var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", transition: "border-color 0.15s" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", color: "var(--foreground)", fontSize: 15, fontWeight: 500, textAlign: "left", gap: 16, fontFamily: "inherit" }}
              >
                <span>{faq.q}</span>
                <span style={{ color: "#d97706", fontSize: 20, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 18px", color: "var(--muted-foreground)", fontSize: 14, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA — matches home page CTA band */}
      <section style={{ background: "var(--foreground)", color: "#fff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "72px 24px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>
            Des questions ? On est là.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
            Notre équipe répond sous 24h. Pas de jargon, pas de prise de tête.
          </p>
          <a
            href="mailto:contact@hassanly.dz"
            style={{ display: "inline-block", background: "#fff", color: "var(--foreground)", padding: "12px 28px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}
          >
            Nous contacter →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "40px 24px", fontSize: 13, color: "var(--muted-foreground)" }}>
          <Logo />
          <p>© {new Date().getFullYear()} hassanly. Tous droits réservés.</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          nav > div:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}

function renderCell(val: boolean | string) {
  if (typeof val === "boolean") {
    return val
      ? <span style={{ color: "#d97706", fontSize: 16, fontWeight: 700 }}>✓</span>
      : <span style={{ color: "var(--border)", fontSize: 18 }}>—</span>;
  }
  return <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{val}</span>;
}

function PlanCard({ plan, onSelect, loading }: { plan: typeof plans[0]; onSelect: (id: string) => void; loading: boolean }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: "var(--radius-lg)",
      border: `${plan.featured ? "2px" : "1px"} solid ${plan.featured ? "#d97706" : "var(--border)"}`,
      background: plan.featured ? "#fffbeb" : "#fff",
      padding: plan.featured ? "36px 28px 32px" : "28px",
      boxShadow: plan.featured ? "0 8px 32px rgba(217,119,6,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
      transform: plan.featured ? "translateY(-6px)" : "none",
    }}>
      {/* Popular badge */}
      {plan.badge && (
        <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#d97706", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 16px", borderRadius: 999, whiteSpace: "nowrap" }}>
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: plan.featured ? "#d97706" : "var(--muted-foreground)", marginBottom: 12 }}>
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
          {plan.price}
        </span>
        <span style={{ fontSize: 14, color: "var(--muted-foreground)", marginLeft: 6 }}>{plan.period}</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: plan.featured ? "#fde68a" : "var(--border)", marginBottom: 24 }} />

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--foreground)", lineHeight: 1.4 }}>
            <span style={{ color: "#d97706", fontWeight: 700, flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan.id)}
        disabled={loading}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "var(--radius-sm)",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          border: plan.featured ? "none" : "1.5px solid var(--border)",
          background: plan.featured ? "#d97706" : "transparent",
          color: plan.featured ? "#fff" : "var(--foreground)",
          fontFamily: "inherit",
          transition: "all 0.15s",
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = plan.featured ? "#b45309" : "var(--muted)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = plan.featured ? "#d97706" : "transparent";
        }}
      >
        {loading ? "Chargement…" : plan.cta}
      </button>
    </div>
  );
}
