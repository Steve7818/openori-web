"use client";

import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "GEO 和 SEO 会互相影响吗？",
    a: "[TODO: 创始人补充]",
  },
  {
    q: "多久能看到效果？",
    a: "[TODO: 创始人补充]",
  },
  {
    q: "诊断报告真的免费吗？付费服务怎么收费？",
    a: "[TODO: 创始人补充]",
  },
  {
    q: "你们怎么证明优化有效？",
    a: "[TODO: 创始人补充]",
  },
  {
    q: "监测数据从哪里来？",
    a: "[TODO: 创始人补充]",
  },
  {
    q: "支持哪些行业？",
    a: "[TODO: 创始人补充]",
  },
];

export default function FaqSection() {
  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20">
        <h2 className="font-['Noto_Serif_SC',serif] text-[32px] md:text-[56px] font-medium text-text-primary text-center mb-16 md:mb-20">
          常见问题
        </h2>

        <div className="max-w-2xl mx-auto flex flex-col">
          {faqs.map((faq, i) => (
            <details key={i} className="group border-b border-border">
              <summary className="flex items-center justify-between py-6 text-base md:text-lg text-text-primary font-medium">
                {faq.q}
                <ChevronDown
                  size={20}
                  className="text-text-secondary shrink-0 ml-4 group-open:rotate-180"
                />
              </summary>
              <div className="pb-6 text-base text-text-secondary leading-[1.7]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
