export const metadata = {
  title: '嘟嘟错题本',
  description: '基于 Gemini AI 的智能录入错题系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
