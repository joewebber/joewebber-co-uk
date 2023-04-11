import Link from 'next/link'

import getPosts from '@utils/getPosts'
import getPost from '@utils/getPost'

import Layout from '@components/Layout'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const Post = ({ post, title, description, ...props }) => {
  return (
    <>
      <Layout pageTitle={`${title} | ${post.fields.title}`}>
        <div className="back">
          ←{' '}
          <Link href="/">
            Back to post list
          </Link>
        </div>
        <article>
          <h1>{post.fields.title}</h1>
          {post.fields.featuredImage && (
            <img
              src={post.fields.featuredImage.fields.file.url}
              className="hero"
              alt={post.fields.featuredImage.fields.description}
            />
          )}
          <div>
            {documentToReactComponents(post.fields.content)}
          </div>
        </article>
      </Layout>
      <style jsx>{`
        article {
          width: 100%;
          max-width: 1200px;
        }
        h1 {
          font-size: 3rem;
        }
        h3 {
          font-size: 2rem;
        }
        .hero {
          width: 100%;
        }
        .back {
          width: 100%;
          max-width: 1200px;
          color: black;
        }
      `}</style>
    </>
  )
}

export default Post

export async function getStaticProps({ ...context }) {
  const configData = await import(`../../siteconfig.json`)

  const post = await getPost(context.slug)

  return {
    props: {
      post: post,
      title: configData.default.title,
      description: configData.default.description,
    },
  }
}

// This function gets called at build time
export async function getStaticPaths() {
  const posts = await getPosts()

  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post) => ({
    params: { slug: post.fields.slug },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}