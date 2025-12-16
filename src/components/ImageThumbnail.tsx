import { useImageUrl } from "../hooks/useImageUrl";
import { theme } from "../theme";

interface ImageThumbnailProps {
  imagePath: string;
  alt?: string;
  height?: string;
  onClick?: () => void;
}

export function ImageThumbnail({
  imagePath,
  alt = "Image",
  height = "150px",
  onClick,
}: ImageThumbnailProps) {
  const imageUrl = useImageUrl(imagePath);
  return (
    <img
      src={imageUrl}
      alt={alt}
      onClick={onClick}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        cursor: onClick ? "pointer" : "default",
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder.svg";
      }}
    />
  );
}
