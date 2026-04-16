const platforms = [
  { name: "豆包", initial: "豆" },
  { name: "DeepSeek", initial: "D" },
  { name: "文心一言", initial: "文" },
  { name: "通义千问", initial: "通" },
  { name: "Kimi", initial: "K" },
  { name: "智谱 GLM", initial: "智" },
];

export default function PlatformSection() {
  return (
    <section id="platforms" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm tracking-[0.1em] text-text-secondary mb-4">
            · 平台覆盖
          </p>
          <h2 className="font-['Noto_Serif_SC',serif] text-[32px] md:text-[56px] font-medium text-text-primary mb-4">
            覆盖 6 大主流 AI 平台
          </h2>
          <p className="text-lg text-text-secondary">
            持续监测 · 每日回测 · 多模型交叉验证
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-bg-secondary border border-border rounded-xl p-8 flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full border-2 border-text-primary flex items-center justify-center">
                <span className="text-lg font-medium text-text-primary">
                  {platform.initial}
                </span>
              </div>
              <span className="text-base text-text-primary text-center">
                {platform.name}
              </span>
            </div>
          ))}
        </div>

        {/* Expanding note */}
        <p className="text-sm text-text-secondary text-center mt-10">
          持续扩展中，Gemini / Claude / GPT 即将接入
        </p>
      </div>
    </section>
  );
}
