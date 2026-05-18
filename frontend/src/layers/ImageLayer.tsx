import { useEffect, useState } from "react";

type ImageLayerProps = {
  imageUri: string | null;
};

export function ImageLayer({ imageUri }: ImageLayerProps) {
  const [frontImage, setFrontImage] = useState<string | null>(imageUri);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!imageUri || imageUri === frontImage) {
      return;
    }

    setBackImage(frontImage);
    setFrontImage(imageUri);
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), 25);
    return () => window.clearTimeout(timer);
  }, [frontImage, imageUri]);

  return (
    <div className="image-layer" aria-label="Generated whiteboard state">
      {backImage ? <img className="whiteboard-image back" src={backImage} alt="" /> : null}
      {frontImage ? (
        <img className={`whiteboard-image front ${visible ? "visible" : ""}`} src={frontImage} alt="" />
      ) : (
        <div className="empty-board">
          <div className="grid-plane" />
          <div className="empty-equation">Ask GuardRail to explore your system architecture</div>
        </div>
      )}
    </div>
  );
}
