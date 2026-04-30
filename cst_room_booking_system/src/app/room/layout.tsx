import ClientAuth from "./components/ClientAuth";

export default function RoomLayout({
  children,
}: {
  children: any;
}) {
  return <ClientAuth>{children}</ClientAuth>;
}
