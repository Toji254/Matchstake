import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { facilitiesConfig, navigationConfig } from '../config/siteConfig';

export default function FacilityDetail() {
  const { slug } = useParams();

  const facility = useMemo(
    () => facilitiesConfig.items.find((item) => item.slug === slug) ?? null,
    [slug]
  );

  if (!facility) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fff', color: '#000',
        fontFamily: "'IBM Plex Mono', monospace", padding: '40px',
      }}>
        <p>{facilitiesConfig.detailNotFoundText}</p>
        <Link to="/" style={{ color: '#000', textDecoration: 'underline' }}>
          {facilitiesConfig.detailReturnText}
        </Link>
      </div>
    );
  }

  return (
    <div className="facility-detail-container">
      <nav className="facility-detail-nav">
        <Link to="/" className="facility-detail-nav-brand">
          {navigationConfig.brandName}
        </Link>
        <Link to="/#facilities" className="facility-detail-nav-back">
          {facilitiesConfig.detailBackText}
        </Link>
      </nav>

      <div className="facility-detail-body">
        <div className="facility-detail-info">
          <h1 style={{
            fontSize: '28px', fontWeight: 400, lineHeight: '34px',
            textTransform: 'uppercase', margin: '0 0 40px 0',
          }}>
            {facility.article.title}
          </h1>
          <div style={{ maxWidth: '520px' }}>
            {facility.article.paragraphs.map((paragraph, index) => (
              <p key={`${facility.slug}-${index}`} style={{
                fontSize: '13px', fontWeight: 400, lineHeight: '22px', margin: '0 0 20px 0',
              }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="facility-detail-image-container">
          {facility.image ? (
            <img src={facility.image} alt={facility.name} className="facility-detail-image" />
          ) : (
             <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', textTransform: 'uppercase', color: '#fff',
            }}>
              No Image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
