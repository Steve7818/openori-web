const comparisons = [
  {
    dimension: "优化目标",
    seo: "搜索结果排名",
    geo: "AI 回答中的提及率",
  },
  {
    dimension: "核心指标",
    seo: "关键词排名",
    geo: "被引用频次 + 权重 + 时效",
  },
  {
    dimension: "内容策略",
    seo: "关键词密度",
    geo: "语义结构化 + 可引用性",
  },
  {
    dimension: "衡量方式",
    seo: "工具可查排名",
    geo: "需持续测试与回测",
  },
];

export default function GeoSection() {
  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm tracking-[0.1em] text-text-secondary mb-4">
            · 什么是 GEO
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[32px] md:text-[56px] font-medium text-text-primary mb-4">
            Generative Engine Optimization
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            生成式引擎优化——为 AI 时代重新定义的内容策略
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-3xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[160px_1fr_1fr] gap-0 border-b border-border pb-4 mb-0">
            <div className="text-sm text-text-secondary" />
            <div className="text-sm font-medium text-text-secondary tracking-wide">
              SEO 时代
            </div>
            <div className="text-sm font-medium text-accent tracking-wide">
              GEO 时代
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[160px_1fr_1fr] gap-0 py-5 border-b border-border/60"
            >
              <div className="text-sm text-text-secondary font-medium">
                {row.dimension}
              </div>
              <div className="text-base text-text-primary">{row.seo}</div>
              <div className="text-base text-text-primary">{row.geo}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
