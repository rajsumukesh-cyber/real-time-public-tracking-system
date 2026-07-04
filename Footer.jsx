import { Bus } from 'lucide-react';

const Footer = () => (
  <footer id="contact" className="bg-transit-navy text-white/70">
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-transit-teal">
            <Bus size={16} />
          </span>
          <span className="font-display text-lg font-bold">TransitLive</span>
        </div>
        <p className="text-sm">Real-time public transport tracking, built for small cities.</p>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-white">Product</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/#features" className="hover:text-white">Features</a></li>
          <li><a href="/#how-it-works" className="hover:text-white">How it works</a></li>
          <li><a href="/register" className="hover:text-white">Get started</a></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-white">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/#about" className="hover:text-white">About</a></li>
          <li><a href="/#" className="hover:text-white">Careers</a></li>
          <li><a href="/#" className="hover:text-white">Press</a></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-white">Contact</h4>
        <ul className="space-y-2 text-sm">
          <li>support@transitlive.app</li>
          <li>+91 90000 00000</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
      © {new Date().getFullYear()} TransitLive. All rights reserved.
    </div>
  </footer>
);

export default Footer;
