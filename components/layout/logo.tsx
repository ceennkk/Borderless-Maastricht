import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const SIZE = {
  sm: "h-10 w-auto",
  md: "h-11 w-auto",
  lg: "h-16 w-auto sm:h-20",
} as const;

/** Maastricht Borderless wordmark. */
export function Logo({
  className,
  href = "/",
  size = "sm",
}: {
  className?: string;
  href?: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <Link href={href} aria-label="Maastricht Borderless" className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Maastricht Borderless"
        width={797}
        height={234}
        className={SIZE[size]}
        priority
      />
    </Link>
  );
}
