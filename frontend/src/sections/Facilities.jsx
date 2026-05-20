import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilitiesConfig } from '../config/siteConfig';

function AnalogClock({ utcOffset = 0 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 48;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utc + utcOffset * 3600000);

      ctx.clearRect(0, 0, size * 2, size * 2);
      ctx.save();
      ctx.translate(size, size);
      ctx.scale(2, 2);

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const inner = 18;
        const outer = 21;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      const hr = localTime.getHours() % 12;
      const hrAngle = ((hr + localTime.getMinutes() / 60) * Math.PI) / 6 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(hrAngle) * 11, Math.sin(hrAngle) * 11);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const minAngle = ((localTime.getMinutes() + localTime.getSeconds() / 60) * Math.PI) / 30 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(minAngle) * 15, Math.sin(minAngle) * 15);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      const secAngle = (localTime.getSeconds() * Math.PI) / 30 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(secAngle) * 17, Math.sin(secAngle) * 17);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [utcOffset]);

  return <canvas ref={canvasRef} style={{ width: '48px', height: '48px', marginBottom: '16px' }} />;
}

function FacilityColumn({ facility }) {
  const [imgHover, setImgHover] = useState(false);

  return (
    <div className="facility-col">
      <Link to={`/facility/${facility.slug}`}>
        <h2 className="facility-title">
          {facility.name}
          {facility.code ? `, ${facility.code}` : ''}
        </h2>
      </Link>

      <div style={{ marginTop: '20px' }}>
        <AnalogClock utcOffset={facility.utcOffset} />
      </div>

      {facility.address && (
        <p className="facility-meta">
          {facility.address}
        </p>
      )}

      {facility.status && (
        <p className="facility-meta" style={{ fontStyle: 'italic' }}>
          {facility.status}
        </p>
      )}

      <p className="facility-meta">{facility.email}</p>
      <p className="facility-meta" style={{ marginBottom: '24px' }}>{facility.phone}</p>

      {facility.ctaText && (
        <Link
          to={facility.ctaHref || '#'}
          className="btn btn-dark"
          style={{ alignSelf: 'flex-start', marginBottom: '32px' }}
        >
          {facility.ctaText}
        </Link>
      )}

      {facility.image && (
        <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
          <img
            src={facility.image}
            alt={facility.name}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              objectFit: 'cover',
              display: 'block',
              opacity: imgHover ? 0.8 : 1,
              transition: 'opacity 0.2s',
              filter: 'grayscale(100%)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Facilities() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const facilities = facilitiesConfig.items;

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const cols = gridRef.current.children;
        const ctx = gsap.context(() => {
          gsap.fromTo(
            Array.from(cols),
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none reverse' },
            }
          );
        }, sectionRef);
      });
    }).catch(() => {
      if (gridRef.current) {
        Array.from(gridRef.current.children).forEach((el) => {
          el.style.opacity = '1';
        });
      }
    });
  }, []);

  if (!facilitiesConfig.sectionLabel && facilities.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="facilities" className="section-light" style={{ borderTop: '1px solid #000' }}>
      <div className="section-inner" style={{ padding: 0 }}>
        <h3 className="section-label" style={{ marginBottom: '40px' }}>
          {facilitiesConfig.sectionLabel}
        </h3>
      </div>

      <div ref={gridRef} className="facilities-grid">
        {facilities.map((facility, index) => (
          <FacilityColumn
            key={facility.slug || `${facility.name}-${index}`}
            facility={facility}
          />
        ))}
      </div>
    </section>
  );
}
