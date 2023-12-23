import { LazyLoadImage } from "react-lazy-load-image-component";
import { useContext, useState } from "react";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import { useRouter } from "next/router";

export default function SoCard({ picUrl, name, id, index, ar }) {
  const router = useRouter();
  const { addToPlaylist } = useContext(SongIdsContext);
  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div
      onClick={() => handleAddToPlaylist(id)}
      key={index}
      className="snap-center cursor-pointer relative"
    >
      <div className="hover:brightness-75 hover:scale-[1.01] transition-all relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=512y512`}
          className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl"
        />
      </div>

      <div className="text-sm">
        <h5 className="font-normal px-1 -mb-0.5">
          <span className="hover:underline font-medium">{name}</span>
        </h5>
        <div className="px-1 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="font-normal hover:underline">{ar}</div>
        </div>
      </div>
      <br />
    </div>
  );
}
