import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import RegistrationForm from '@/features/auth/RegistrationForm.jsx';
import './RegistrationPage.css';

function RegistrationPage() {
  return (
    <div className="registration-page">
      <Card title={MESSAGES.AUTH.REGISTER_LINK}>
        <RegistrationForm />
        <p className="registration-page__login">
          <Link to={ROUTES.LOGIN}>{MESSAGES.AUTH.LOGIN}</Link>
        </p>
      </Card>
    </div>
  );
}

export default RegistrationPage;
