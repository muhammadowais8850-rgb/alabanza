import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const S = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p} />
);

export const SearchIcon = (p: P) => <S {...p}><circle cx="9" cy="9" r="5.5" /><path d="m13.2 13.2 3.3 3.3" /></S>;
export const AccountIcon = (p: P) => <S {...p}><circle cx="10" cy="6.5" r="3.5" /><path d="M3.5 17.5v-.8a4.7 4.7 0 0 1 4.7-4.7h3.6a4.7 4.7 0 0 1 4.7 4.7v.8z" /></S>;
export const BagIcon = (p: P) => <S {...p}><path d="M3.5 6.9h13v8.6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2zM7 6.9V5.3A2.3 2.3 0 0 1 9.3 3h1.4A2.3 2.3 0 0 1 13 5.3v1.6" /></S>;
export const BagPlusIcon = (p: P) => <S {...p}><path d="M16.6 9.4V6.9H3.4v8a2.1 2.1 0 0 0 2.1 2.1h3.1M8.8 3h2.4a2.3 2.3 0 0 1 2.3 2.3v1.6H6.5V5.3A2.3 2.3 0 0 1 8.8 3M14.6 12.6v5m2.5-2.5h-5" /></S>;
export const MenuIcon = (p: P) => <S {...p}><path d="M3 6h14M3 10h14M3 14h14" /></S>;
export const CloseIcon = (p: P) => <S {...p}><path d="m5 5 10 10M15 5 5 15" /></S>;
export const ChevronLeft = (p: P) => <S {...p}><path d="m12 5-5 5 5 5" /></S>;
export const ChevronRight = (p: P) => <S {...p}><path d="m8 5 5 5-5 5" /></S>;
export const ChevronDown = (p: P) => <S width="12" height="12" {...p}><path d="m5 8 5 5 5-5" /></S>;
export const PlusIcon = (p: P) => <S width="14" height="14" {...p}><path d="M4 10h12M10 4v12" /></S>;
export const MinusIcon = (p: P) => <S width="14" height="14" {...p}><path d="M4 10h12" /></S>;
export const ArrowRight = (p: P) => <S {...p}><path d="M3 10h14m-5-5 5 5-5 5" /></S>;

// Trust / accordion icons (outline style from the live theme).
export const TrustIcon = ({ name, ...p }: P & { name: string }) => {
  if (name === "returns") return <S {...p}><path d="M12 1.5h1.5a6 6 0 0 1 0 12H2M6.4 7.4 1.5 13.1l5 5" /></S>;
  if (name === "box") return <S {...p}><path d="m10 1.2 8 3v10.2l-8 4-8-4V4.2zM2 4.5l8 3.6 8-3.6M10 8v10.2M6 2.8l8 3.3" /></S>;
  if (name === "truck") return <S {...p}><path d="M.8 3.8h10V14H7.2M2.7 14H.8V3.8M10.8 6.4l8.4 2v5.6h-2M13.3 14h-2.5" /><circle cx="5" cy="14.2" r="2" /><circle cx="15" cy="14.2" r="2" /></S>;
  if (name === "chat") return <S {...p}><path d="M10.2 2a8 8 0 0 1 6.8 12.2c-.3.5 1.4 3 .8 3.5-.4.4-2.7-1.3-3.3-.9A8 8 0 1 1 10.2 2z" /><circle cx="6.8" cy="10.2" r=".5" fill="currentColor" /><circle cx="10.2" cy="10.2" r=".5" fill="currentColor" /><circle cx="13.6" cy="10.2" r=".5" fill="currentColor" /></S>;
  return <S {...p}><path d="M10 17s-7-4.3-7-9.2A3.8 3.8 0 0 1 10 5.6a3.8 3.8 0 0 1 7 2.2C17 12.7 10 17 10 17z" /></S>;
};

export const WhatsAppIcon = (p: P) => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5 0-.2-.3-.3-.6-.4z" />
  </svg>
);

const socialPaths: Record<string, string> = {
  Facebook: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z",
  Instagram: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.2 5.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.2 16.1 2.1C14.5 2 9.5 2 7.9 2.1c-1.6.1-3 .4-4.2 1.6S2.2 6.3 2.1 7.9C2 9.5 2 14.5 2.1 16.1c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zm-2.1 10a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9a3.3 3.3 0 0 1 1.9-1.9C7.4 3.7 10.5 3.8 12 3.8s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9z",
  Youtube: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3z",
  Tiktok: "M19.6 6.7A4.8 4.8 0 0 1 16 2.5V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.7V9.5a6.3 6.3 0 1 0 5.4 6.2V8.8a8.2 8.2 0 0 0 4.8 1.5V6.9a4.8 4.8 0 0 1-1.2-.2z",
};
export const SocialIcon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d={socialPaths[name]} /></svg>
);
