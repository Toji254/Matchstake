import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import Manifesto from '../sections/Manifesto';
import HowItWorks from '../sections/HowItWorks';
import Facilities from '../sections/Facilities';
import Observation from '../sections/Observation';
import Archives from '../sections/Archives';
import SiteFooter from '../sections/SiteFooter';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [hash]);

  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <HowItWorks />
        <Facilities />
        <Observation />
        <Archives />
      </main>
      <SiteFooter />
    </>
  );
}
