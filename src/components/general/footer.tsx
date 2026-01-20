"use client";

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/icon";

const Footer = () => {
  const companyLinks = [
    { name: "About us", href: "/about" },
    { name: "Deals", href: "/deals-dashboard" },
    { name: "Community", href: "/community" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Dispute & Feedback", href: "/dispute" },
    { name: "Tweet @ us", href: "https://twitter.com/slyce" },
  ];

  const linksLinks = [
    { name: "Become a vendor", href: "/vendor-signup" },
    { name: "Get Started", href: "/user-registration" },
  ];

  const LinkColumn = ({
    title,
    links,
  }: {
    title: string;
    links: { name: string; href: string }[];
  }) => (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-gray-600 hover:text-blue-500 transition-colors text-sm"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="container mx-auto px-4 pt-12 pb-8">
        {/* Main Footer */}
        <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-10">
          {/* Logo + Socials */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <div className="flex items-center mb-6">
              <Image
                src="/logo-black.png"
                alt="Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>

            <div className="flex space-x-4">
              <Link href="https://instagram.com/slyce">
                <Icon
                  name="Instagram"
                  size={24}
                  className="text-gray-500 hover:text-blue-500"
                />
              </Link>
              <Link href="https://facebook.com/slyce">
                <Icon
                  name="Facebook"
                  size={24}
                  className="text-gray-500 hover:text-blue-500"
                />
              </Link>
              <Link href="https://twitter.com/slyce">
                <Icon
                  name="X"
                  size={24}
                  className="text-gray-500 hover:text-blue-500"
                />
              </Link>
              <Link href="https://linkedin.com/slyce">
                <Icon
                  name="Link"
                  size={24}
                  className="text-gray-500 hover:text-blue-500"
                />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16 w-full md:w-3/4">
            <LinkColumn title="Company" links={companyLinks} />
            <LinkColumn title="Support" links={supportLinks} />
            <LinkColumn title="Links" links={linksLinks} />

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <Icon name="Phone" size={16} className="mr-2 text-gray-500" />
                  <a
                    href="tel:+2340000000000"
                    className="text-gray-600 hover:text-blue-500"
                  >
                    +234 000 000 0000
                  </a>
                </li>
                <li className="flex items-center">
                  <Icon name="Mail" size={16} className="mr-2 text-gray-500" />
                  <a
                    href="mailto:slyce@customercare.com"
                    className="text-gray-600 hover:text-blue-500"
                  >
                    slyce@customercare.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-sm text-gray-500">
          <p>© Copyright by Slyce. All rights reserved</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-blue-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-500">
              Terms of Use
            </Link>
            <Link href="/legal" className="hover:text-blue-500">
              Legal
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-dotted border-blue-300" />
      </div>
    </footer>
  );
};

export default Footer;
