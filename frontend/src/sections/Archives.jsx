import { useEffect, useRef, useState, useCallback } from 'react';
import { archivesConfig } from '../config/siteConfig';

export default function Archives() {
  const sceneRef = useRef(null);
  const carouselRef = useRef(null);
  const wrapperRef = useRef(null);
  const previewRef = useRef(null);
  const scrollTlRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const vaultImages = archivesConfig.items;

  const setupCarouselCells = useCallback(() => {
    if (!carouselRef.current) return;
    const cells = carouselRef.current.querySelectorAll('.carousel__cell');
    const count = cells.length;
    if (!count) return;
    const radius = 500;
    const angleStep = 360 / count;
    cells.forEach((cell, index) => {
      cell.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
    });
  }, []);

  const createScrollTimeline = useCallback(() => {
    if (!wrapperRef.current || !carouselRef.current) return;
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const carousel = carouselRef.current;
        const cards = carousel.querySelectorAll('.carousel__cell img');
        const tl = gsap.timeline({
          defaults: { ease: 'sine.inOut' },
          scrollTrigger: {
            trigger: wrapperRef.current, start: 'top bottom',
            end: 'bottom top', scrub: true,
          },
        });
        tl.fromTo(carousel, { rotationY: 0 }, { rotationY: -180 }, 0);
        tl.fromTo(carousel, { rotationZ: 3, rotationX: 3 }, { rotationZ: -3, rotationX: -3 }, 0);
        tl.fromTo(cards, { filter: 'brightness(250%)' }, { filter: 'brightness(80%)', ease: 'power3' }, 0);
        tl.fromTo(cards, { rotationZ: 10 }, { rotationZ: -10, ease: 'none' }, 0);
        scrollTlRef.current = tl;
      });
    }).catch(() => {});
  }, []);

  const activatePreview = useCallback(() => {
    if (!carouselRef.current || !previewRef.current) return;
    import('gsap').then(({ default: gsap }) => {
      const carousel = carouselRef.current;
      const cards = carousel.querySelectorAll('.carousel__cell img');
      const previewGridItems = previewRef.current.querySelectorAll('.grid__item');
      if (scrollTlRef.current) {
        scrollTlRef.current.scrollTrigger?.kill();
        scrollTlRef.current.kill();
      }
      setPreviewOpen(true);
      const tl = gsap.timeline({ defaults: { duration: 1.5, ease: 'power2.inOut' } });
      tl.to(carousel, { rotationX: 90, rotationY: -360, z: -2000 }, 0);
      tl.to(carousel, { duration: 2.5, ease: 'power3.inOut', z: 1500, rotationZ: 270 }, 0.7);
      tl.to(cards, { rotationZ: 0 }, 0);
      tl.add(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        Array.from(previewGridItems).forEach((el) => {
          const rect = el.getBoundingClientRect();
          const elX = rect.left + rect.width / 2;
          const elY = rect.top + rect.height / 2;
          const dx = centerX - elX;
          const dy = centerY - elY;
          const dist = Math.hypot(dx, dy);
          const delay = (dist / window.innerWidth) * 0.1;
          const isLeft = elX < centerX;
          gsap.fromTo(el,
            { autoAlpha: 0, y: dy * 0.5, scale: 0.5, rotationY: isLeft ? 100 : -100, z: -3500 },
            { autoAlpha: 1, y: 0, scale: 1, rotationY: 0, z: 0, duration: 0.4, ease: 'sine', delay: delay + 0.1 }
          );
        });
      }, '<+=1.9');
    }).catch(() => { setPreviewOpen(true); });
  }, []);

  const closePreview = useCallback(() => {
    if (!previewRef.current || !carouselRef.current) return;
    import('gsap').then(({ default: gsap }) => {
      const items = previewRef.current.querySelectorAll('.grid__item');
      gsap.to(Array.from(items), {
        autoAlpha: 0, scale: 0.8, z: -1000, duration: 0.5,
        ease: 'power2.in', stagger: 0.03,
        onComplete: () => {
          setPreviewOpen(false);
          gsap.set(carouselRef.current, { rotationX: 0, rotationY: 0, rotationZ: 0, z: 0 });
          createScrollTimeline();
        },
      });
    }).catch(() => { setPreviewOpen(false); });
  }, [createScrollTimeline]);

  useEffect(() => {
    setupCarouselCells();
    createScrollTimeline();
    return () => {
      if (scrollTlRef.current) {
        scrollTlRef.current.scrollTrigger?.kill();
        scrollTlRef.current.kill();
      }
    };
  }, [setupCarouselCells, createScrollTimeline]);

  return (
    <>
      <section ref={wrapperRef} id="archives" style={{
        background: '#000', color: '#fff', minHeight: '200vh', position: 'relative',
      }}>
        <div style={{ padding: '80px 40px 40px', position: 'relative', zIndex: 10 }}>
          <h3 className="section-label" style={{ color: '#fff', margin: 0 }}>
            {archivesConfig.sectionLabel}
          </h3>
        </div>
        <div ref={sceneRef} style={{
          perspective: '900px', position: 'sticky', top: 0,
          height: '100vh', display: 'flex', justifyContent: 'center',
          alignItems: 'center', overflow: 'hidden',
        }}>
          <button onClick={activatePreview} style={{
            position: 'absolute', top: '40px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 20,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px',
            textTransform: 'uppercase', color: '#fff', background: 'transparent',
            border: '1px solid #fff', borderRadius: '26px', padding: '10px 28px',
            cursor: 'pointer', letterSpacing: '0.08em',
            transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
          >
            {archivesConfig.vaultTitle}
          </button>
          <div ref={carouselRef} style={{
            width: '400px', height: '500px', position: 'absolute',
            transformStyle: 'preserve-3d', willChange: 'transform',
            transform: 'translateZ(-550px) rotateY(0deg)',
          }}>
            {vaultImages.map((item, index) => (
              <div key={`${item.label}-${index}`} className="carousel__cell" style={{
                position: 'absolute', width: '350px', height: '420px',
                left: '0', top: '0', transformStyle: 'preserve-3d',
              }}>
                <img src={item.src} alt={item.label} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block', filter: 'grayscale(100%)',
                }} />
                <span style={{
                  position: 'absolute', bottom: '12px', left: '12px',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
                  textTransform: 'uppercase', color: '#fff', letterSpacing: '0.05em',
                  background: 'rgba(0,0,0,0.6)', padding: '4px 8px',
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div ref={previewRef} style={{
        position: 'fixed', inset: 0, padding: '0 15vw',
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px', alignContent: 'center', justifyItems: 'center',
        opacity: previewOpen ? 1 : 0,
        pointerEvents: previewOpen ? 'auto' : 'none',
        zIndex: 100, background: 'rgba(0,0,0,0.95)', transition: 'opacity 0.3s',
      }}>
        <button onClick={closePreview} style={{
          position: 'absolute', top: '32px', right: '40px',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px',
          textTransform: 'uppercase', color: '#fff', background: 'transparent',
          border: '1px solid #fff', borderRadius: '26px', padding: '8px 20px',
          cursor: 'pointer', letterSpacing: '0.08em', zIndex: 110,
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
        >
          {archivesConfig.closeText}
        </button>
        {vaultImages.map((item, index) => (
          <div key={`${item.label}-${index}`} className="grid__item" style={{
            willChange: 'transform, clip-path', position: 'relative',
            transformStyle: 'preserve-3d', visibility: 'hidden',
          }}>
            <img src={item.src} alt={item.label} style={{
              width: '100%', maxWidth: '400px', height: 'auto',
              display: 'block', filter: 'grayscale(100%)',
            }} />
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
              marginTop: '8px', letterSpacing: '0.05em',
            }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
