import { footerConfig } from '../config/siteConfig';

export default function SiteFooter() {
  return (
    <footer style={{
      background: '#ffffff', color: '#000000', borderTop: '1px solid #000',
      padding: '32px 40px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '12px', fontWeight: 400, textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      <span>{footerConfig.copyrightText}</span>
      <span>{footerConfig.statusText}</span>
    </footer>
  );
}
