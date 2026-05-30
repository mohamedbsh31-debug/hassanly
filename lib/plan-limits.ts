// ── Plan limits — single source of truth ──────────────────────────────────
export type Plan = 'starter' | 'pro' | 'elite'

export const PLAN_LIMITS: Record<Plan, {
  maxBarbers: number       // -1 = unlimited
  maxServices: number      // -1 = unlimited
  hasVerifiedBadge: boolean
  hasAnalytics: boolean
  hasPriorityListing: boolean
}> = {
  starter: {
    maxBarbers:          1,
    maxServices:         5,
    hasVerifiedBadge:    false,
    hasAnalytics:        false,
    hasPriorityListing:  false,
  },
  pro: {
    maxBarbers:          5,
    maxServices:         -1,
    hasVerifiedBadge:    true,
    hasAnalytics:        true,
    hasPriorityListing:  false,
  },
  elite: {
    maxBarbers:          -1,
    maxServices:         -1,
    hasVerifiedBadge:    true,
    hasAnalytics:        true,
    hasPriorityListing:  true,
  },
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[(plan as Plan)] ?? PLAN_LIMITS.starter
}
