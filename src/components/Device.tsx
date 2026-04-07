import { useRef, useEffect, useState, useCallback } from "react";

/** Fixed device dimensions (border-box: border included in width/height) */
const DEVICE_W = 300;
const DEVICE_H = 600;
/** Side-button overhang on each side */
const BTN_OVERHANG = 17;
/** Total visual width the device occupies including side buttons */
const VISUAL_W = DEVICE_W + BTN_OVERHANG * 2; // 334

function DeviceScreenshot({
  children,
  className,
}: React.ComponentPropsWithRef<"div">) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    if (!outerRef.current) return;
    const available = outerRef.current.clientWidth;
    setScale(available >= VISUAL_W ? 1 : available / VISUAL_W);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={outerRef}
      className={`relative mx-auto ${className ?? ""}`}
      style={{
        maxWidth: VISUAL_W,
        /* Reserve the correct scaled height so surrounding layout doesn't overlap */
        height: DEVICE_H * scale,
      }}
    >
      <div
        style={{
          width: DEVICE_W,
          height: DEVICE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          /* Center the fixed-size box inside the fluid outer wrapper */
          position: "absolute",
          left: "50%",
          marginLeft: -(DEVICE_W / 2),
        }}
        className="relative border-[rgb(var(--color-fill))] bg-skin-fill border-[14px] rounded-[2.5rem]"
      >
        <div className="h-[32px] w-[3px] bg-skin-fill absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-skin-fill absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-skin-fill absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-skin-fill absolute -end-[17px] top-[142px] rounded-e-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-skin-fill">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DeviceScreenshot;
