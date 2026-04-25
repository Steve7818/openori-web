import HeroSection from "@/components/HeroSection";

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
    </main>
  );
}
