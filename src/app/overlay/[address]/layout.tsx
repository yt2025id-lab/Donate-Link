import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DonateLink - OBS Overlay",
  description: "Real-time donation overlay for OBS",
};

export default function OverlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-transparent">
      {children}
    </div>
  );
}
