import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Importing social icons
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

// Column 1: Page Links
const pageLinks = [
  { href: '/events', label: 'Events' },
  { href: '/community', label: 'Community' },
  { href: '/sports', label: 'Sports' },
  { href: '/dashboard', label: 'Dashboard' },
];

// Column 2: Social Links
const socialLinks = [
  { href: '#', label: 'GitHub', icon: <Github className="w-4 h-4" /> },
  { href: '#', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
  { href: '#', label: 'Twitter', icon: <Twitter className="w-4 h-4" /> },
  { href: '#', label: 'Contact Mail', icon: <Mail className="w-4 h-4" /> },
];

// Column 3: Get Involved Links (More relevant for RYZE)
const getInvolvedLinks = [
  { href: '/host-event', label: 'Host an Event' },
  { href: '/start-team', label: 'Start a Team' },
  { href: '/contact-admin', label: 'Contact Admin' },
  { href: '/register', label: 'Register' },
];

// Column 4: Legal Links
const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
];

export default function Footer() {
  return (
    // Set to a very dark gray/black background, remove old border and glows
    <footer className="bg-[#000000] text-white py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          
          {/* Column 1: Brand & Copyright (like the image) */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="RYZE Logo"
                width={12}
                height={32}
                className="h-8 w-auto filter brightness-0 invert"
              />
              <span className="text-2xl font-bold text-white">
                RYZE
              </span>
            </Link>
            <p className="text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} RYZE.
            </p>
            <p className="text-xs text-gray-400">
              All rights reserved.
            </p>
            
            {/* "Crafted by Harry" credit, styled cleanly */}
            <p className="text-xs text-gray-500 mt-6">
              Crafted by Harry
            </p>
          </div>

          {/* Column 2: Pages */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5 text-gray-400">Pages</h4>
            <nav className="flex flex-col gap-3">
              {pageLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Socials */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5 text-gray-400">Socials</h4>
            <nav className="flex flex-col gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Column 4: Get Involved */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5 text-gray-400">Get Involved</h4>
            <nav className="flex flex-col gap-3">
              {getInvolvedLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 5: Legal */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5 text-gray-400">Legal</h4>
            <nav className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </div>
    </footer>
  );
}