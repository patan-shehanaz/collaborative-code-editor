import EditorComponent from "./EditorComponent";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return <EditorComponent roomId={roomId} />;
}