import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { speak, speechSupported, stopSpeaking } from "@/lib/game/speech";
import { cn } from "@/lib/utils";

export function ReadAloudButton({ text, className, label = "Read aloud" }: { text: string; className?: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => setSupported(speechSupported()), []);
  useEffect(() => () => stopSpeaking(), []);

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (speaking) {
          stopSpeaking();
          setSpeaking(false);
          return;
        }
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }}
      className={cn(
        "press-3d shadow-press inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-sunny text-sunny-foreground [--press-shadow:var(--sunny-deep)]",
        speaking && "animate-pulse-ring",
        className,
      )}
    >
      <Volume2 className="size-6" />
    </button>
  );
}
