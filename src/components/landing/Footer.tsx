import { forwardRef } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const footerLinks = {
    "University": ["B.Tech / B.E", "B.Com", "BBA", "B.Sc", "BA"],
    "Exams": ["Semester Exams", "Internal Tests", "Practicals", "Viva"],
    "Practice": ["Previous Year Papers", "Mock Tests", "Topic-wise Practice", "Quick Revision"],
    "Free Resources": ["Study Notes", "Important Questions", "Answer Templates", "Exam Tips"],
  };

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer ref={ref} className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground">
                <span className="text-lg font-bold text-primary">W</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Smarter prep for every step of your academic journey.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/80">
              © 2025 Simplex Labs Pvt Ltd. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
