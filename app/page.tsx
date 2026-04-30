import HeroSection from "@/components/HeroSection";
import Section3Capability from "@/components/sections/Section3Capability";
import Section4Proof from "@/components/sections/Section4Proof";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lensDebug = sp?.['lens-debug'] === '1';
  const pageParam = sp?.page;
  const initialPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  return (
    <main>
      <HeroSection
        initialLensDebug={lensDebug}
        initialPage={initialPage}
      />
      <Section3Capability />
      <Section4Proof />
    </main>
  );
}
