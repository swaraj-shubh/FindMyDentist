import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";
import { FmdMark } from "./brand";
import { SocialIcon } from "./social-icon";

export function SiteFooter() {
  const link = "inline-flex items-center gap-2 rounded-md text-white/85 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none";
  return (
    <footer className="w-full bg-[oklch(0.2_0.015_255)] px-6 text-white pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left sm:px-10">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 font-semibold"><span className="flex size-9 items-center justify-center rounded-xl bg-white p-1"><FmdMark className="size-full" /></span>FindMyDentist</p>
          <p className="mt-2 max-w-xs text-sm text-white/60">Your dental world, connected. Find dentists, manage care and learn, all in one place.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li><a href={`mailto:${CONTACT.email}`} className={link}><Mail className="size-4" aria-hidden />{CONTACT.email}</a></li>
            <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className={link}><Phone className="size-4" aria-hidden />{CONTACT.phone}</a></li>
            <li className="flex items-center gap-2 text-white/60"><MapPin className="size-4" aria-hidden />{CONTACT.address}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Follow us</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {CONTACT.socials.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label}: ${s.handle}`} title={s.label} className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none">
                  <SocialIcon id={s.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-5xl border-t border-white/10 pt-4 text-xs text-white/50">© {new Date().getFullYear()} FindMyDentist. All rights reserved.</p>
    </footer>
  );
}
