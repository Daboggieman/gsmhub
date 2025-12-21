import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faTwitter, 
  faInstagram, 
  faYoutube, 
  faLinkedin 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhone, 
  faLocationDot,
  faMobileScreen,
  faNewspaper,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a237e] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block bg-white p-2 rounded-lg">
              <Image
                src="/images/logo.svg"
                alt="GSMHub Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-blue-100 text-sm leading-relaxed opacity-80">
              The ultimate source for mobile phone specifications, reviews, and news. 
              Find your next device with our comprehensive database.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-400 transition-colors" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faMobileScreen} className="text-blue-300" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-blue-100 opacity-80 text-sm">
              <li><Link href="/devices" className="hover:text-white transition-colors">All Phones</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/brands" className="hover:text-white transition-colors">Popular Brands</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Compare Devices</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">Latest News</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faNewspaper} className="text-blue-300" />
              Resources
            </h4>
            <ul className="space-y-3 text-blue-100 opacity-80 text-sm">
              <li><Link href="/reviews" className="hover:text-white transition-colors">Expert Reviews</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">Tech Glossary</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/coverage" className="hover:text-white transition-colors">Network Coverage</Link></li>
              <li><Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleInfo} className="text-blue-300" />
              Contact Us
            </h4>
            <ul className="space-y-3 text-blue-100 opacity-80 text-sm">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="mt-1" />
                <span>123 Tech Avenue, Digital City, DC 10101</span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} />
                <span>+1 (555) 000-GSMH</span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>contact@gsmhub.com</span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-xs">
              <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-white transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-100 opacity-60">
          <p>&copy; {currentYear} GSMHub. All rights reserved.</p>
          <div className="flex gap-6">
            <p>Designed for Mobile Enthusiasts</p>
            <p>Powered by Next.js & NestJS</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;