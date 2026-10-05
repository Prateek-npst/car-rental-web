import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import './PageHeading.css';

function PageHeading({ title, breadcrumbs = [], description, actions }) {
  return (
    <header className="page-heading">
      <div className="page-heading__copy">
        {breadcrumbs.length > 0 && (
          <nav aria-label={MESSAGES.NAVIGATION.BREADCRUMB_LABEL}>
            <ol className="page-heading__breadcrumbs">
              {breadcrumbs.map((breadcrumb, index) => {
                const isCurrent = index === breadcrumbs.length - 1;

                return (
                  <li key={`${breadcrumb.label}-${index}`}>
                    {breadcrumb.to ? (
                      <Link to={breadcrumb.to}>{breadcrumb.label}</Link>
                    ) : (
                      <span aria-current={isCurrent ? 'page' : undefined}>
                        {breadcrumb.label}
                      </span>
                    )}
                    {!isCurrent && <span aria-hidden="true"> / </span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="page-heading__title">{title}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {actions && <div className="page-heading__actions">{actions}</div>}
    </header>
  );
}

PageHeading.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    }),
  ),
  description: PropTypes.string,
  actions: PropTypes.node,
};

export default PageHeading;