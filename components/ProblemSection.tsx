import { Search, Sparkles, MessageCircle } from "lucide-react";

const cards = [
  {
    year: "2020",
    icon: Search,
    text: "Google 主导，SEO 是答案",
  },
  {
    year: "2025",
    icon: Sparkles,
    text: "AI 平台占据 40%+ 搜索流量",
  },
  {
    year: "未来",
    icon: MessageCircle,
    text: "品牌认知将由 AI 答案定义",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm tracking-[0.1em] text-text-secondary mb-4">
            · 正在发生
          </p>
          <h2 className="font-['Noto_Serif_SC',serif] text-[32px] md:text-[56px] font-medium text-text-primary">
            搜索正在发生一场
            <br className="hidden md:block" />
            静默的迁移
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {cards.map((card) => (
            <div
              key={card.year}
              className="bg-bg-secondary border border-border rounded-xl p-10 flex flex-col items-center text-center gap-5"
            >
              <span className="text-sm font-medium tracking-widest text-text-secondary">
                {card.year}
              </span>
              <card.icon size={32} strokeWidth={1.5} className="text-text-primary" />
              <p className="text-base text-text-primary">{card.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <p className="font-['Noto_Serif_SC',serif] text-[24px] md:text-[40px] text-center leading-[1.3] text-text-primary max-w-3xl mx-auto">
          你花 10 年做的 SEO，
          <br className="md:hidden" />
          AI 不一定听得见。
        </p>
      </div>
    </section>
  );
}
