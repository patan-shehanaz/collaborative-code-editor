export function generateRoomId(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";

  let roomId = "room-";

  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return roomId;
}