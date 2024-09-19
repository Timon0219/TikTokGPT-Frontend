import { IonIcon } from "@ionic/react";
import useImage from "../../hooks/useImage";
import Avatar from "../Avatar/Avatar";
import Image from "../Image/Image";
import ImageSkeleton from "../Skeleton/ImageSkeleton";
import { downloadOutline, checkmarkOutline } from "ionicons/icons";
import { useState } from "react";
import { ChatMessageType } from "../../store/store";

type Props = {
  loading: boolean;
  image: string;
};

export default function ImageMessage({ loading, image }: Props) {
  const [isImagesDownloaded, setIsImagesDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsImagesDownloaded(true);
    // i will add this later
  };

  return (
    <div className="flex items-start w-full pb-4">
      <div className=" image border-4 border-teal-700 rounded flex-grow">
        {loading && (
          <div className=" h-[300px] w-full">
            <ImageSkeleton />
          </div>
        )}
        <div className=" flex items-center flex-wrap">
          {!loading && <Image src={image} key={image} />}
        </div>
      </div>
    </div>
  );
}
