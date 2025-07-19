import './globals.css'

export const metadata = {
  title: 'RFQ Planning Tool',
  description: 'Resource planning and management for RFQ responses',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}