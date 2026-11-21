import { site } from '../data/site';
import Arrow from '../components/Arrow';
import { usePageMeta } from '../hooks/useSite';
import '../styles/pages.css';

export default function Contact() {
  usePageMeta(
    `联系 · ${site.archiveTitle}`,
    '通过邮件或其他渠道联系。',
  );

  const year = new Date().getFullYear();

  return (
    <div className="page contact">
      <div className="shell">
        <div className="contact-top">
          <span className="meta">Contact · 联系</span>
          <span className="meta">{year}</span>
        </div>

        <h1 className="contact-title">写信给我</h1>

        <p className="contact-lede">
          关于作品、合作，或者只是想说点什么，都可以直接发邮件。我读得慢，但每一封都会看。
        </p>

        <a className="contact-mail" href={`mailto:${site.email}`}>
          {site.email}
        </a>

        <div className="contact-links">
          {site.links
            .filter((l) => l.label !== '邮件')
            .map((l) => {
              const pending = !l.href;
              return pending ? (
                <div className="contact-row contact-row--pending" key={l.label} data-reveal="">
                  <span className="contact-row__label">{l.label}</span>
                  <span className="contact-row__value">{l.note ?? '待补充'}</span>
                  <span className="contact-row__arrow" aria-hidden="true" />
                </div>
              ) : (
                <a
                  className="contact-row"
                  key={l.label}
                  data-reveal=""
                  href={l.href}
                  target={l.href?.startsWith('http') ? '_blank' : undefined}
                  rel={l.href?.startsWith('http') ? 'noreferrer noopener' : undefined}
                >
                  <span className="contact-row__label">{l.label}</span>
                  <span className="contact-row__value">{l.value}</span>
                  <span className="contact-row__arrow">
                    <Arrow size={22} />
                  </span>
                </a>
              );
            })}
        </div>

        <div className="contact-note">
          <span className="meta">说明</span>
          <p>
            标为“待补充”的渠道尚未启用。在补齐之前，邮件是唯一可靠的联络方式。档案内容会持续更新，欢迎过一段时间再来看看。
          </p>
        </div>
      </div>
    </div>
  );
}
