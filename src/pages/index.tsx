import Layout from '@components/Layout'

import styles from '@styles/Home.module.css'

interface Props {
  title?: string
  description?: string
}

const Index = ({ title, description }: Props) => {
  return (
    <>
      <Layout pageTitle={title || ''} description={description}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Web / Software Engineer &amp; Consultant<span>.</span>
          </h1>
          <h2 className={styles.intro}>
            20 years of experience building websites and online applications.
            <br />
            Bespoke solutions, consulting and technical direction.
          </h2>
        </div>
      </Layout>
    </>
  )
}

export default Index
