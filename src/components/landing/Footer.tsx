import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "Test Prep": ["MCAT Prep", "LSAT Prep", "DAT Prep", "GRE Prep", "GMAT Prep"],
    "Courses": ["University", "High School", "AP Courses", "Tutoring"],
    "Company": ["About Us", "Careers", "Blog", "Press"],
    "Support": ["Help Center", "Contact Us", "Terms of Service", "Privacy Policy"],
  };

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
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
              © 2024 TestPrep. All rights reserved.
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
};

export default Footer;
