export type UserRole = 'client' | 'barber_owner' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string                  // matches auth.users.id
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          wilaya: string | null       // Algerian province
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          wilaya?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          wilaya?: string | null
          updated_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          wilaya: string
          address: string | null
          phone: string | null
          is_active: boolean
          is_verified: boolean
          rating: number | null
          plan: 'starter' | 'pro' | 'elite'
          plan_expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shops']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shops']['Insert']>
      }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Shop = Database['public']['Tables']['shops']['Row']
