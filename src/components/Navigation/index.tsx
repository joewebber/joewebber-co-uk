import Link from 'next/link'

import styles from './Navigation.module.css'

const Navigation = () => {
  return (
    <nav className={styles.nav} role="navigation" aria-label="main navigation">
      <ul>
        <li>
          <Link href="/work">Work</Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
