import LogoPlaceholder from "./LogoPlaceholder";

const footerLinks = {
  产品: ["AI 可见度诊断", "GEO 优化服务", "平台监测"],
  公司: ["关于我们", "加入团队", "联系我们"],
  法律: ["隐私政策", "服务条款"],
};

export default function Footer() {
  return (
    <footer id="about" className="border-t border-border py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        {/* Top */}
        <div className="flex flex-col items-center gap-3 mb-14">
          <div className="flex items-center gap-3">
            <LogoPlaceholder size={32} />
            <span className="font-['Instrument_Serif',serif] text-xl tracking-[0.15em] text-text-primary">
              ORIGENO
            </span>
          </div>
          <p className="text-sm text-text-secondary">[TODO: Slogan 待定]</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-14 max-w-xl mx-auto">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-text-primary mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-secondary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="text-center text-sm text-text-secondary border-t border-border pt-8">
          © 2026 Origeno · [备案号 TODO] · hello@origeno.io
        </div>
      </div>
    </footer>
  );
}
