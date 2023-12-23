import { LazyLoadImage } from "react-lazy-load-image-component";
import { useRouter } from "next/router";
import { useState } from "react";
import { PlayIcon } from "@radix-ui/react-icons";

export default function PlCard({
  picUrl,
  id,
  name,
  index,
  signature,
  playCount,
}) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);

  function formatPlayCount(playCount) {
    if (playCount >= 1000) {
      return (playCount / 1000).toFixed(0) + "k";
    } else {
      return playCount.toString();
    }
  }
  return (
    <div
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative cursor-pointer w-full"
      onClick={() => router.push(`/playlist?id=${id}`)}
    >
      <div className="hover:brightness-75 hover:scale-[1.01] transition-all w-full relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=512y512`}
          className="object-cover w-full transition-all  bg-neutral-200 dark:bg-neutral-800 rounded-xl"
        />
      </div>

      <div className="text-sm">
        <div className="flex flex-row text-xs text-neutral-600 dark:text-neutral-400">
          <div className="font-normal">
            Played {formatPlayCount(playCount)} times
          </div>
        </div>
        <h5 className="font-medium px-1">
          <span className="hover:underline">{name}</span>
        </h5>
      </div>
      <br />
    </div>
  );
}
