import { redirect } from 'next/navigation';

/**
 * The photo upload now lives on the live challenge page. This route stays so older links and
 * bookmarks still land in the right place.
 */
export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/verify/session/${id}/live`);
}
