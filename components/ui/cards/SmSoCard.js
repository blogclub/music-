import { useContext } from "react";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import moment from "moment";
import { Button } from "../button";
import RightClick from "@/components/layout/RightClick";

export default function SmSoCard({ duration, picUrl, name, id, index, ar }) {
  const { songIds, currentSongIndex, addToPlaylist, removeFromPlaylist } =
    useContext(SongIdsContext);
  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <RightClick name={name} ar={ar} picUrl={picUrl} id={id}>
      <Button
        onClick={() => handleAddToPlaylist(id)}
        key={index}
        variant={songIds[currentSongIndex] === id ? "secondary" : "ghost"}
        className="w-full flex space-x-4 py-6 my-1"
      >
        <div className="align-center opacity-75 font-medium text-sm">
          {(index + 1).toString().padStart(2, "0")}
        </div>

        <div className="text-base  flex flex-row w-full justify-between">
          <h1 className="font-medium text-base w-24 md:w-56 sm:w-64 truncate text-left">
            {name}
          </h1>
          <span className="font-medium opacity-75 text-left truncate w-16 md:w-40 sm:w-48">
            {ar}
          </span>
          <span className="opacity-50 text-sm font-medium">
            {moment(duration).format("mm:ss")}
          </span>
        </div>
      </Button>
    </RightClick>
  );
}
