import { useEffect, useRef } from 'react';
import { manifestoConfig } from '../config/siteConfig';

export default function Manifesto() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);

  const hasContent = manifestoConfig.text || manifestoConfig.videoPath;

  useEffect(() => {
    if (!hasContent) return;
    if (!sectionRef.current || !textRef.current || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(videoRef.current);
    observer.observe(textRef.current);

    return () => observer.disconnect();
  }, [hasContent]);

  useEffect(() => {
    if (!hasContent) return;
    let ctx;
    try {
      import('gsap').then(({ default: gsap }) => {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          gsap.registerPlugin(ScrollTrigger);
          if (!sectionRef.current) return;
          ctx = gsap.context(() => {
            if (videoRef.current) {
              gsap.fromTo(videoRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
                  scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' }
                }
              );
            }
            if (textRef.current) {
              gsap.fromTo(textRef.current,
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
                  scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' }
                }
              );
            }
          }, sectionRef);
        });
      }).catch(() => {});
    } catch (e) {}
    return () => { if (ctx) ctx.revert(); };
  }, [hasContent]);

  if (!hasContent) {
    return null;
  }

  return (
    <section ref={sectionRef} id="manifesto" className="section-light">
      <div className="manifesto-grid">
        {manifestoConfig.videoPath ? (
          <div
            ref={videoRef}
            style={{
              opacity: 0,
              transform: 'translateY(50px)',
              transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              >
                <source src={manifestoConfig.videoPath} type="video/mp4" />
              </video>
            </div>
          </div>
        ) : (
          <div ref={videoRef} />
        )}

        <p
          ref={textRef}
          className="manifesto-text"
          style={{
            opacity: 0,
            transform: 'translateY(60px)',
            transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
          }}
        >
          {manifestoConfig.text}
        </p>
      </div>
    </section>
  );
}
