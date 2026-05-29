"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "3 000",
    period: "DA/mois",
    badge: null,
    color: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    accent: "#c9a96e",
    features: [
      "1 profil coiffeur",
      "Réservation en ligne",
      "Jusqu'à 5 services",
      "Notifications SMS",
    ],
    cta: "Commencer",
    ctaStyle: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    price: "6 500",
    period: "DA/mois",
    badge: "Populaire",
    color: "from-amber-900/40 to-zinc-900",
    border: "border-amber-600/60",
    accent: "#d4af37",
    features: [
      "Jusqu'à 5 coiffeurs",
      "Services illimités",
      "Analytics & rapports",
      "Badge Salon Vérifié",
      "Notifications SMS + WhatsApp",
    ],
    cta: "Choisir Pro",
    ctaStyle: "filled",
  },
  {
    id: "elite",
    name: "Elite",
    price: "12 000",
    period: "DA/mois",
    badge: null,
    color: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    accent: "#c9a96e",
    features: [
      "Coiffeurs illimités",
      "Multi-adresses",
      "Support prioritaire 24/7",
      "Mise en avant",
      "Programme fidélité",
    ],
    cta: "Choisir Elite",
    ctaStyle: "outline",
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

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  function handleSelectPlan(planId: string) {
    // Route to dashboard billing tab — middleware will catch unauthenticated
    // users and redirect them to login first, then back here after login.
    router.push(`/dashboard?tab=billing&plan=${planId}`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e0e0e",
        color: "#f0ece4",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflowX: "hidden",
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radial gold glow top */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ─── Header ─── */}
        <header
          style={{
            textAlign: "center",
            padding: "80px 24px 60px",
          }}
        >
          {/* Logo wordmark */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "48px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2C14 2 8 6 8 14C8 18.4 10.8 22 14 22C17.2 22 20 18.4 20 14C20 6 14 2 14 2Z"
                fill="#d4af37"
                opacity="0.9"
              />
              <path
                d="M14 26L12 22H16L14 26Z"
                fill="#d4af37"
                opacity="0.6"
              />
              <circle cx="14" cy="14" r="3" fill="#0e0e0e" />
            </svg>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "0.12em",
                color: "#f0ece4",
                textTransform: "uppercase",
              }}
            >
              Hassanly
            </span>
          </div>

          {/* Decorative line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(to right, transparent, #d4af37)",
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
                fill="#d4af37"
                opacity="0.8"
              />
            </svg>
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(to left, transparent, #d4af37)",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: "400",
              letterSpacing: "0.02em",
              lineHeight: "1.1",
              marginBottom: "20px",
              color: "#f0ece4",
            }}
          >
            Choisissez Votre
            <br />
            <span
              style={{
                color: "#d4af37",
                fontStyle: "italic",
              }}
            >
              Formule
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#9a9490",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: "1.7",
              fontFamily: "system-ui, sans-serif",
              fontWeight: "300",
            }}
          >
            Des outils pensés pour les salons algériens. Simple, puissant,
            sans contrat.
          </p>
        </header>

        {/* ─── Pricing Cards ─── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px 80px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} featured={i === 1} onSelect={handleSelectPlan} />
          ))}
        </section>

        {/* ─── Guarantee Banner ─── */}
        <section
          style={{
            maxWidth: "760px",
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "16px",
              padding: "32px 40px",
              background: "rgba(212,175,55,0.03)",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#f0ece4",
                  marginBottom: "6px",
                }}
              >
                14 jours d&apos;essai gratuit
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#9a9490",
                  lineHeight: "1.6",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Testez Hassanly sans engagement. Aucune carte bancaire requise.
                Annulez à tout moment.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Feature Comparison Table ─── */}
        <section
          style={{
            maxWidth: "900px",
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "400",
              color: "#f0ece4",
              marginBottom: "40px",
              letterSpacing: "0.02em",
            }}
          >
            Comparaison des formules
          </h2>

          <div
            style={{
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <ComparisonTable />
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section
          style={{
            maxWidth: "700px",
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "400",
              color: "#f0ece4",
              marginBottom: "40px",
              letterSpacing: "0.02em",
            }}
          >
            Questions fréquentes
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid",
                  borderColor: openFaq === i ? "rgba(212,175,55,0.3)" : "#2a2a2a",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  background:
                    openFaq === i ? "rgba(212,175,55,0.03)" : "transparent",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#f0ece4",
                    fontSize: "15px",
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{
                      color: "#d4af37",
                      fontSize: "20px",
                      flexShrink: 0,
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 24px 20px",
                      color: "#9a9490",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section
          style={{
            textAlign: "center",
            padding: "60px 24px 80px",
            borderTop: "1px solid #1e1e1e",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#9a9490",
              marginBottom: "12px",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Des questions ?
          </p>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: "400",
              color: "#f0ece4",
              marginBottom: "28px",
            }}
          >
            Notre équipe est là pour vous
          </h2>
          <a
            href="mailto:contact@hassanly.dz"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              border: "1px solid rgba(212,175,55,0.5)",
              borderRadius: "8px",
              color: "#d4af37",
              fontSize: "15px",
              fontFamily: "system-ui, sans-serif",
              textDecoration: "none",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(212,175,55,0.08)";
              el.style.borderColor = "#d4af37";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.borderColor = "rgba(212,175,55,0.5)";
            }}
          >
            Nous contacter
          </a>
        </section>
      </div>
    </main>
  );
}

/* ─── Plan Card Component ─── */
function PlanCard({
  plan,
  featured,
  onSelect,
}: {
  plan: (typeof plans)[0];
  featured: boolean;
  onSelect: (planId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "20px",
        border: `1px solid`,
        borderColor: featured
          ? hovered
            ? "#d4af37"
            : "rgba(212,175,55,0.45)"
          : hovered
          ? "rgba(212,175,55,0.3)"
          : "#2a2a2a",
        background: featured
          ? "linear-gradient(160deg, rgba(212,175,55,0.07) 0%, #111 100%)"
          : "linear-gradient(160deg, #161616 0%, #0e0e0e 100%)",
        padding: featured ? "40px 32px 36px" : "32px 28px",
        transform: featured
          ? hovered
            ? "translateY(-6px) scale(1.01)"
            : "translateY(-4px)"
          : hovered
          ? "translateY(-3px)"
          : "none",
        transition: "all 0.3s ease",
        boxShadow: featured
          ? hovered
            ? "0 24px 60px rgba(212,175,55,0.12)"
            : "0 16px 40px rgba(212,175,55,0.07)"
          : hovered
          ? "0 12px 32px rgba(0,0,0,0.4)"
          : "none",
      }}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #b8860b, #d4af37, #b8860b)",
            color: "#0e0e0e",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 18px",
            borderRadius: "20px",
            fontFamily: "system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          ✦ {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div
        style={{
          fontSize: "13px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: plan.accent,
          marginBottom: "16px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: "600",
        }}
      >
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ marginBottom: "28px" }}>
        <span
          style={{
            fontSize: "clamp(38px, 5vw, 52px)",
            fontWeight: "300",
            color: "#f0ece4",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            fontSize: "14px",
            color: "#6a6560",
            marginLeft: "6px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {plan.period}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: featured
            ? "linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)"
            : "linear-gradient(to right, transparent, #2a2a2a, transparent)",
          marginBottom: "28px",
        }}
      />

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 32px 0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {plan.features.map((feature, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              fontSize: "14px",
              color: "#c8c4bc",
              fontFamily: "system-ui, sans-serif",
              lineHeight: "1.4",
            }}
          >
            <span
              style={{
                color: plan.accent,
                fontSize: "12px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan.id)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          fontSize: "14px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: "600",
          letterSpacing: "0.05em",
          cursor: "pointer",
          transition: "all 0.2s",
          border: "1px solid",
          ...(plan.ctaStyle === "filled"
            ? {
                background: "linear-gradient(135deg, #b8860b, #d4af37)",
                borderColor: "transparent",
                color: "#0e0e0e",
              }
            : {
                background: "transparent",
                borderColor: "rgba(212,175,55,0.35)",
                color: "#d4af37",
              }),
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          if (plan.ctaStyle === "filled") {
            el.style.background = "linear-gradient(135deg, #d4af37, #f0c040)";
          } else {
            el.style.borderColor = "#d4af37";
            el.style.background = "rgba(212,175,55,0.07)";
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          if (plan.ctaStyle === "filled") {
            el.style.background = "linear-gradient(135deg, #b8860b, #d4af37)";
          } else {
            el.style.borderColor = "rgba(212,175,55,0.35)";
            el.style.background = "transparent";
          }
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── Comparison Table ─── */
const tableRows = [
  { feature: "Profils coiffeurs", starter: "1", pro: "5", elite: "Illimités" },
  { feature: "Services", starter: "5 max", pro: "Illimités", elite: "Illimités" },
  { feature: "Réservation en ligne", starter: true, pro: true, elite: true },
  { feature: "Notifications SMS", starter: true, pro: true, elite: true },
  { feature: "Notifications WhatsApp", starter: false, pro: true, elite: true },
  { feature: "Analytics & rapports", starter: false, pro: true, elite: true },
  { feature: "Badge Salon Vérifié", starter: false, pro: true, elite: true },
  { feature: "Multi-adresses", starter: false, pro: false, elite: true },
  { feature: "Mise en avant", starter: false, pro: false, elite: true },
  { feature: "Programme fidélité", starter: false, pro: false, elite: true },
  { feature: "Support prioritaire 24/7", starter: false, pro: false, elite: true },
];

function ComparisonTable() {
  const col = (val: boolean | string) => {
    if (typeof val === "boolean") {
      return val ? (
        <span style={{ color: "#d4af37", fontSize: "16px" }}>✓</span>
      ) : (
        <span style={{ color: "#3a3a3a", fontSize: "14px" }}>—</span>
      );
    }
    return (
      <span style={{ color: "#c8c4bc", fontSize: "13px", fontFamily: "system-ui, sans-serif" }}>
        {val}
      </span>
    );
  };

  const headerStyle: React.CSSProperties = {
    padding: "16px 20px",
    textAlign: "center",
    fontSize: "12px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontFamily: "system-ui, sans-serif",
    fontWeight: "700",
    color: "#9a9490",
    background: "#111",
    borderBottom: "1px solid #2a2a2a",
  };

  const cellStyle: React.CSSProperties = {
    padding: "14px 20px",
    textAlign: "center",
    borderBottom: "1px solid #1a1a1a",
  };

  const featCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: "left",
    fontSize: "13px",
    color: "#9a9490",
    fontFamily: "system-ui, sans-serif",
    paddingLeft: "24px",
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ ...headerStyle, textAlign: "left", paddingLeft: "24px" }}>
            Fonctionnalité
          </th>
          <th style={headerStyle}>Starter</th>
          <th
            style={{
              ...headerStyle,
              color: "#d4af37",
              background: "rgba(212,175,55,0.05)",
            }}
          >
            Pro ✦
          </th>
          <th style={headerStyle}>Elite</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((row, i) => (
          <tr
            key={i}
            style={{
              background: i % 2 === 0 ? "#0e0e0e" : "#111",
            }}
          >
            <td style={featCellStyle}>{row.feature}</td>
            <td style={cellStyle}>{col(row.starter)}</td>
            <td
              style={{
                ...cellStyle,
                background: "rgba(212,175,55,0.03)",
              }}
            >
              {col(row.pro)}
            </td>
            <td style={cellStyle}>{col(row.elite)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
