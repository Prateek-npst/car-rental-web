import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { useNavigate } from 'react-router-dom';
import './ForbiddenPage.css';

function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-page">
      <Card title={MESSAGES.ACCESS.FORBIDDEN_TITLE}>
        <p>{MESSAGES.ACCESS.FORBIDDEN_MESSAGE}</p>
        <Button onClick={() => navigate(ROUTES.VEHICLES)} type="button">
          {MESSAGES.ACCESS.BACK_TO_VEHICLES}
        </Button>
      </Card>
    </div>
  );
}

export default ForbiddenPage;