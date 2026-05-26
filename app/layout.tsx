import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hassanly — Réservez votre coiffeur en Algérie',
  description: 'Trouvez et réservez les meilleurs coiffeurs près de chez vous. Disponible dans toute l\'Algérie.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
