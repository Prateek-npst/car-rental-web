import PageHeading from '@/components/ui/PageHeading.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { useAuth } from '@/context/AuthContext.jsx';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const unavailable = MESSAGES.PROFILE.VALUE_UNAVAILABLE;

  return (
    <div className="profile-page">
      <PageHeading
        breadcrumbs={[{ label: MESSAGES.NAVIGATION.PROFILE }]}
        title={MESSAGES.NAVIGATION.PROFILE}
      />
      <section aria-label={MESSAGES.PROFILE.TITLE} className="profile-page__details">
        <dl>
          <div>
            <dt>{MESSAGES.PROFILE.NAME}</dt>
            <dd>{user?.name || unavailable}</dd>
          </div>
          <div>
            <dt>{MESSAGES.PROFILE.EMAIL}</dt>
            <dd>{user?.email || unavailable}</dd>
          </div>
          <div>
            <dt>{MESSAGES.PROFILE.ROLE}</dt>
            <dd>{user?.role || unavailable}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default ProfilePage;