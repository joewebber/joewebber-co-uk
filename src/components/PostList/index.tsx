import Link from 'next/link'

import styles from './PostList.module.css'

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
                  {post.publishDate}: {` `}
                  <Link href={{ pathname: `/post/${post.slug}` }}>
                    {post?.title}
                  </Link>
                </li>
              )
            })}
        </ul>
      </div>
    </>
  )
}
