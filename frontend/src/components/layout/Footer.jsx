import { Link } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__brand">{MESSAGES.APP.NAME}</p>
        <nav aria-label="Footer navigation" className="footer__nav">
          <Link to={ROUTES.VEHICLES}>{MESSAGES.NAVIGATION.VEHICLES}</Link>
          <Link to={ROUTES.BOOKINGS}>{MESSAGES.NAVIGATION.BOOKINGS}</Link>
        </nav>
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} {MESSAGES.APP.NAME}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
