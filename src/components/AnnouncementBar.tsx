import { Sparkles } from "lucide-react";

// Height is fixed (h-8) because the navbar and NavbarSpacer offset themselves by it.
export default function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 w-full h-8 bg-creme text-obsidian z-[130] flex items-center justify-center gap-1.5 px-3 font-semibold">
      <Sparkles size={11} className="opacity-70 shrink-0" />
      <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.3em] uppercase leading-none text-center truncate">
        Complimentary Global Shipping · Signature Gift Wrapping
      </span>
    </div>
  );
}
