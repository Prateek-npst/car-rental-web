import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import LoginForm from '@/features/auth/LoginForm.jsx';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-page">
      <Card title={MESSAGES.AUTH.LOGIN}>
        <LoginForm />
        <p className="login-page__register">
          {MESSAGES.AUTH.REGISTER_PROMPT}{' '}
          <Link to={ROUTES.REGISTER}>{MESSAGES.AUTH.REGISTER_LINK}</Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;
