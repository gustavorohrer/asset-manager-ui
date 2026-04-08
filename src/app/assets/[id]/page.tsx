import { AssetDetails } from "@/features/assets/asset-details";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssetPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16 sm:px-8 lg:px-12">
      <AssetDetails id={id} />
    </main>
  );
}
