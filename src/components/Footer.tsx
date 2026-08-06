
import type { ContactInfoData } from '@/sanity/types';
import styles from './Footer.module.css';
import CookieSettingsButton from './CookieSettingsButton';
import {
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaXTwitter,
} from 'react-icons/fa6';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <FaInstagram />,
  tiktok: <FaTiktok />,
  linkedin: <FaLinkedin />,
  facebook: <FaFacebook />,
  youtube: <FaYoutube />,
  twitter: <FaXTwitter />,
  x: <FaXTwitter />,
};

export default function Footer({ contact }: { contact: ContactInfoData }) {
  // BEWERKEN: social links worden beheerd via Sanity (Contactgegevens → Social media links)
  const socialLinks = contact.socialLinks ?? [];

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div>
          © ANTERA AGENCY 2026 <CookieSettingsButton />
        </div>
        {/* Alleen echte profielen tonen. Er stonden hier eerder twee
            placeholder-iconen met href="#": die waren focusbaar,
            werden als link aangekondigd en brachten de bezoeker bij
            een klik terug naar de bovenkant van de pagina. Zolang er
            in Sanity (Contactgegevens → Social media links) niets is
            ingevuld, tonen we dus liever niets dan een link die
            nergens heen gaat. */}
        {socialLinks.length > 0 && (
          <div className={styles.social}>
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
              >
                {PLATFORM_ICONS[link.platform.toLowerCase()] ??
                  link.platform.slice(0, 2).toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
