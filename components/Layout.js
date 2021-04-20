import Head from 'next/head'

import Header from './Header'

export default function Layout({ children, pageTitle, description, ...props }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="Description" content={description}></meta>
        <title>{pageTitle}</title>
      </Head>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800;900&display=swap');

        html,
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
            sans-serif;
          color: black;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: bold;
        }

        a {
          color: black;
        }

        .content {
          width: calc(100% - 40px);
          max-width: 1200px;
          padding: 2rem 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: left;
          align-items: left;
          margin: 0 auto;
        }

        footer {
          width: 100%;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <section className="layout">
        <Header />
        <div className="content">{children}</div>
      </section>
      <footer>
      </footer>
    </>
  )
}
