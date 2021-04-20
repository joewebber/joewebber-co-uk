import Link from 'next/link'

export default function PostList({ posts }) {
  if (posts === 'undefined') return null

  return (
    <>
      <div>
        <h3>Latest Posts</h3>
        {!posts && <div>No posts!</div>}
        <ul>
          {posts &&
            posts.map((post) => {
              return (
                <li key={post.slug}>
                  {post.frontmatter.date}: {` `}
                  <Link href={{ pathname: `/post/${post.slug}` }}>
                    <a>{post?.frontmatter?.title}</a>
                  </Link>
                </li>
              )
            })}
        </ul>
      </div>
      <style jsx>{`
        ul {
          padding-left: 0;
        }
        li {
          list-style: none;
          font-size: 1.4rem;
        }
        a {
          text-decoration: none;
        }
      `}</style>
    </>
  )
}
