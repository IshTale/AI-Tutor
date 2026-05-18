import type { CSSProperties, PropsWithChildren } from "react";

type WrapperLayerProps = PropsWithChildren<{
  style: CSSProperties;
}>;

export function WrapperLayer({ children, style }: WrapperLayerProps) {
  return (
    <div className="wrapper-layer" style={style}>
      {children}
    </div>
  );
}
