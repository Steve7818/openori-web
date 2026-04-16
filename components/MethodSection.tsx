import { BarChart3, Clock, Target } from "lucide-react";

const methods = [
  {
    icon: BarChart3,
    title: "权重 Weight",
    description:
      "品牌在 AI 回答中的位置、措辞强度、是否被列为首选。不同平台的权重算法不同，我们持续追踪每个平台的细节变化。",
  },
  {
    icon: Clock,
    title: "时效 Freshness",
    description:
      "内容被 AI 采纳的时间衰减曲线。不同平台的索引速度和遗忘速度差异显著，我们精准预测每一次内容投放的黄金窗口。",
  },
  {
    icon: Target,
    title: "成本 Cost",
    description:
      "每一次 AI 可见度提升的边际投入。我们帮你在预算内实现最大可见度增量——不是堆量，是精准投放。",
  },
];

export default function MethodSection() {
  return (
    <section id="method" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm tracking-[0.1em] text-text-secondary mb-4">
            · 我们的方法
          </p>
          <h2 className="font-['Noto_Serif_SC',serif] text-[32px] md:text-[56px] font-medium text-text-primary mb-4">
            三维度追踪，让每一次
            <br className="hidden md:block" />
            优化都可验证
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Origeno Method — 从「内容投放」到「回测验证」的闭环
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {methods.map((method) => (
            <div
              key={method.title}
              className="bg-bg-secondary border border-border rounded-xl p-10 flex flex-col gap-5"
            >
              <method.icon
                size={28}
                strokeWidth={1.5}
                className="text-text-primary"
              />
              <h3 className="text-2xl font-medium text-text-primary font-['Noto_Serif_SC',serif]">
                {method.title}
              </h3>
              <p className="text-base text-text-secondary leading-[1.7]">
                {method.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
