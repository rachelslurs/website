import type { ComponentType, SVGProps } from "react";
import {
  BoltIcon,
  CircleStackIcon,
  CodeBracketIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  LinkIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export const BLUEPRINT_PEGBOARD_ICON_KEYS = [
  "terminal",
  "cpu",
  "code",
  "link",
  "monitor",
  "zap",
  "database",
  "wrench",
] as const;

export type BlueprintPegboardIconKey =
  (typeof BLUEPRINT_PEGBOARD_ICON_KEYS)[number];

const blueprintIconMap: Record<
  BlueprintPegboardIconKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  terminal: CommandLineIcon,
  cpu: CpuChipIcon,
  code: CodeBracketIcon,
  link: LinkIcon,
  monitor: ComputerDesktopIcon,
  zap: BoltIcon,
  database: CircleStackIcon,
  wrench: WrenchScrewdriverIcon,
};

export function BlueprintCardIcon({
  name,
  className,
  "aria-hidden": ariaHidden = true,
}: {
  name?: BlueprintPegboardIconKey;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const Cmp = name ? blueprintIconMap[name] : CommandLineIcon;
  return <Cmp className={className} aria-hidden={ariaHidden} />;
}
