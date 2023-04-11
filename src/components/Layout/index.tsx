import Head from 'next/head'

import Header from '@components/Header'

import styles from './Layout.module.css'

interface Props {
  children: React.ReactNode
  pageTitle: string
  description?: string
}

export default function Layout({ children, pageTitle, description }: Props) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="Description" content={description}></meta>
        <title>{pageTitle}</title>
      </Head>
      <section className={styles.layout}>
        <Header />
        <div className={styles.content}>{children}</div>
      </section>
      <footer></footer>
    </>
  )
}
