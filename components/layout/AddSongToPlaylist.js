import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import site from "@/lib/site.config";
import axios from "axios";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";

export default function AddSongToPlaylist({ id, picUrl, ar, name }) {
  const [pid, setPid] = useState("");
  const [result, setResult] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const cookie = localStorage.getItem("cookie");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const playlistResponse = await axios.get(
          `${site.api}/user/playlist?uid=${userData.data.account.id}&cookie=${cookie}`
        );
        const playlistData = playlistResponse.data;
        setPlaylists(playlistData.playlist);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData(); // 调用 fetchData 函数来获取用户详情和歌单数据
  }, []); // 空数组作为依赖项，确保只在组件挂载后调用一次

  const handleAddToPlaylist = async () => {
    try {
      const response = await axios.get(
        `${site.api}/playlist/tracks?op=add&pid=${pid}&tracks=${id}&cookie=${cookie}`
      );
      setResult(response.data);
      toast({
        title: "添加成功",
        description: "( •̀ ω •́ )y",
      });
    } catch (error) {
      console.error(error);
    }
  };
  const createdPlaylists = playlists.filter(
    (playlist) => playlist.creator.userId === userData.data.account.id
  );
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>添加歌曲到歌单</DialogTitle>
        <DialogDescription>
          只需选择需要添加到的歌单，而后轻点“完成”
        </DialogDescription>
      </DialogHeader>
      <Card className="flex flex-row space-x-2 w-full p-1 bg-zinc-200 dark:bg-zinc-800">
        <LazyLoadImage
          src={`${picUrl}?param128y128`}
          effect="blur"
          className="rounded-xl size-12"
        />
        <div className="flex flex-col w-40 mt-1 truncate">
          <h2 className="text-sm font-medium">{name}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{ar}</p>
        </div>
      </Card>
      <Select value={pid} onValueChange={setPid}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择要添加到的歌单" />
        </SelectTrigger>
        <SelectContent>
          {createdPlaylists.map((pl) => {
            return <SelectItem value={pl.id}>{pl.name}</SelectItem>;
          })}
        </SelectContent>
      </Select>
      <DialogFooter>
        <Button className="w-full" onClick={handleAddToPlaylist}>
          完成
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
