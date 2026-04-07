import { AssetsList } from "@/features/assets/assets-list";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16 sm:px-8 lg:px-12">
      <AssetsList />
    </main>
  );
}
