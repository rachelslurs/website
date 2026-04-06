function DeviceScreenshot({
  children,
  className,
}: React.ComponentPropsWithRef<"div">) {
  return (
    <div
      className={`relative mx-auto border-[rgb(var(--color-fill))] bg-skin-fill border-[14px] rounded-[2.5rem] h-[600px] w-[300px] ${className}`}
    >
      <div className="h-[32px] w-[3px] bg-skin-fill absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-skin-fill absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-skin-fill absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-skin-fill absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-skin-fill">
        {children}
      </div>
    </div>
  );
}

export default DeviceScreenshot;
