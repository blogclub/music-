import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import site from "@/lib/site.config";
import axios from "axios";
import { SongIdsContext } from "./SongIdsContext";
import { useTheme } from "next-themes";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

export default function Bar() {
  const {
    getAllSongIds,
    addToPlaylist,
    removeAllFromPlaylist,
    removeFromPlaylist,
  } = useContext(SongIdsContext);
  const playIds = getAllSongIds();
  const { theme, setTheme } = useTheme();
  const [keyword, setKeyword] = useState("");
  const [playlistDetails, setPlaylistDetails] = useState([]);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const handleMouseEnter = (itemId) => {
    setHoveredItemId(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null);
  };
  const router = useRouter();
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // 拼接搜索路径并进行跳转
      const url = `/search?keywords=${encodeURIComponent(keyword)}`;
      router.push(url);
    }
  };
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const response = await axios.get(`${site.api}/song/detail`, {
          params: {
            ids: playIds.join(","),
          },
        });
        setPlaylistDetails(response.data.songs);
      } catch (error) {
        alert("Error fetching playlist details: ", error);
      }
    };

    if (playIds.length > 0) {
      fetchPlaylistDetails();
    }
  }, [playIds]);
  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  const handleRemoveFromPlaylist = (trackId) => {
    removeFromPlaylist(trackId);
  };
  const handleRemoveAll = () => {
    removeAllFromPlaylist();
  };
  return (
    <Menubar className="px-4 rounded-none border-x-0 border-t-0 border-b py-2 fixed w-full top-0 z-[999999]">
      <MenubarMenu>
        <MenubarTrigger>发现</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => router.push("/listen-now")}>
            现在就听
          </MenubarItem>
          <MenubarItem onClick={() => router.push("/explore")}>
            浏览
          </MenubarItem>
          <MenubarItem disabled={true}>
            电台<Badge className="ml-1">即将推出</Badge>
          </MenubarItem>
          <MenubarSeparator />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            type="search"
            onKeyPress={handleKeyPress}
            className=""
            placeholder="搜索..."
          />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>账户</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => router.push("/login")}>登录</MenubarItem>
          <MenubarItem onClick={() => router.push("/dashboard")}>
            仪表盘
          </MenubarItem>
          <MenubarItem disabled={true}>
            设置<Badge className="ml-1">即将推出</Badge>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>主题</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setTheme("system")}>系统</MenubarItem>
          <MenubarItem onClick={() => setTheme("light")}>明亮</MenubarItem>
          <MenubarItem onClick={() => setTheme("dark")}>黑暗</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>播放列表</MenubarTrigger>
        <MenubarContent className="w-80 sm:w-96">
          <ScrollArea className="w-full h-96">
            {playlistDetails &&
              playlistDetails.map((song) => {
                const isHovered = song.id === hoveredItemId;

                return (
                  <MenubarItem
                    key={song.id}
                    onMouseEnter={() => handleMouseEnter(song.id)}
                    onMouseLeave={handleMouseLeave}
                    className="flex flex-row justify-between transition-all "
                  >
                    <span className="w-full">{song.name}</span>
                    <div className="w-24 flex flex-row justify-end transition-all duration-500 space-x-1">
                      {(isHovered || window.innerWidth < 1360) && (
                        <>
                          <Button
                            onClick={() => handleAddToPlaylist(song.id)}
                            className="p-0 size-6 transition-all"
                            variant="ghost"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Button>

                          <Button
                            onClick={() => handleRemoveFromPlaylist(song.id)}
                            className="p-0 size-6 mr-2 transition-all"
                            variant="ghost"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                            </svg>
                          </Button>
                        </>
                      )}
                    </div>
                  </MenubarItem>
                );
              })}
          </ScrollArea>
          <MenubarSeparator />
          <MenubarItem onClick={() => handleRemoveAll}>移除全部</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
