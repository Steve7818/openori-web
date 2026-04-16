import { Check } from "lucide-react";

const valuePoints = [
  "6 大 AI 平台覆盖率扫描",
  "关键词可见度评分 + 竞品对比",
  "基于三维度模型的优化方向建议",
];

export default function DiagnosisSection() {
  return (
    <section id="diagnosis" className="bg-[#1A1A1A] py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20 text-center">
        <h2 className="font-['Noto_Serif_SC',serif] text-[32px] md:text-[56px] font-medium text-white mb-6">
          免费诊断：看看你的品牌
          <br className="hidden md:block" />
          在 AI 里的真实状态
        </h2>

        <p className="text-lg text-[#999] max-w-2xl mx-auto mb-12">
          一份 8-12 页的深度报告，展示你在 6 大 AI 平台的完整可见度图谱
        </p>

        {/* Value points */}
        <div className="flex flex-col gap-4 items-center mb-12">
          {valuePoints.map((point) => (
            <div key={point} className="flex items-center gap-3">
              <Check size={18} strokeWidth={2} className="text-accent" />
              <span className="text-base text-white/80">{point}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#"
          className="inline-block bg-accent text-white text-lg font-medium rounded-md px-12 py-5"
        >
          立即获取免费报告 →
        </a>

        <p className="text-sm text-[#666] mt-6">
          每月限量接受 50 份深度诊断请求 · 通常 3 个工作日内交付
        </p>
      </div>
    </section>
  );
}
