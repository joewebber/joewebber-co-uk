import Link from 'next/link'

export default function Header() {
  return (
    <>
      <header className="header">
        <nav className="nav" role="navigation" aria-label="main navigation">
          <Link href="/" className="logo">
            <a>Joe Webber</a>
          </Link>
        </nav>
      </header>
      <style jsx>{`
        header {
          width: 100%;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        nav {
          width: calc(100% - 40px);
          max-width: 1200px;
          font-weight: bold;
          font-size: 1.3rem;
        }
        nav a {
          margin-right: 20px;
          color: black;
          text-decoration: none;
        }
        nav a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}
