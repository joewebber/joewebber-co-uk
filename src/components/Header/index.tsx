import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Joe Webber<span>.</span>
        </Link>
        <nav
          className={styles.nav}
          role="navigation"
          aria-label="main navigation"
        >
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
      </header>
    </>
  )
}
