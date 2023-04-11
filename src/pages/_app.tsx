import { Inter } from 'next/font/google'

import '../styles/globals.css'
import type { AppProps } from 'next/app'

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800', '900'],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --sans-font: ${sans.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  )
}
