import Link from 'next/link'

import Layout from '@components/Layout'
import PostList from '@components/PostList'

import getPosts from '@utils/getPosts'

const Index = ({ posts, title, description, ...props }) => {
  return (
    <>
      <Layout pageTitle={title} description={description}>
        <h1 className="title">I'm a Software Engineer. This is my blog</h1>
        <h2>I write about stuff that interests me, and the occasional tutorial, mainly for my own benefit.
          Topics include <Link href="/"><a>Cloud Computing</a></Link>, <Link href="/"><a>Docker</a></Link>, <Link href="/"><a>Javascript</a></Link>, <Link href="/"><a>Python</a></Link> and occassionally <Link href="/"><a>something more interesting</a></Link>.
        During the day, I work on Cloud Applications built in Javascript and Python and deployed to Google Cloud. At night, I like to play Minecraft and tinker with code.</h2>
        <main>
          <PostList posts={posts} />
        </main>
      </Layout>
      <style jsx>{`
        .title {
          margin: 1rem 0;
          font-size: 3rem;
        }

        h2 {
          max-width: 800px;
          line-height: 2.4rem;
        }
      `}</style>
    </>
  )
}

export default Index

export async function getStaticProps() {
  const configData = await import(`../siteconfig.json`)

  const data = await getPosts()
  const posts = data.map((p) => {
    return p.fields
  })

  return {
    props: {
      posts,
      title: configData.default.title,
      description: configData.default.description,
    },
  }
}
