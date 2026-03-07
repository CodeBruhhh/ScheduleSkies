import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-section">
          <img src="/logo.png" alt="Schedule Skies Logo" className="logo" />
          <h1 className="brand-name">Schedule Skies</h1>
        </div>
        <ul className="nav-menu">
          <li><Link href="#home">Home</Link></li>
          <li><Link href="#features">Features</Link></li>
          <li><Link href="/plan">Plan Trip</Link></li>
          <li><Link href="#about">About</Link></li>
        </ul>
      </div>
    </nav>
  )
}
