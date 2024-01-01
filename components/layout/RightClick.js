import { useContext, useEffect, useState } from "react";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Separator } from "../ui/separator";
import site from "@/lib/site.config";
import axios from "axios";

export default function RightClick({
  children,
  name,
  ar,
  id,
  picUrl,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const {
    playIds,
    songIds,
    currentSongIndex,
    addToPlaylist,
    removeFromPlaylist,
  } = useContext(SongIdsContext);
  useEffect(() => {}, [playIds]);
  const songId = songIds[currentSongIndex];
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const cookie = localStorage.getItem("cookie");

  useEffect(() => {
    if (userData) {
      checkLikedMusic(userData.data.account.id, songId);
    }
  }, [songId]);

  useEffect(() => {
    localStorage.setItem("isLiked", isLiked); // 每次 isLiked 更新后保存到本地存储
  }, [isLiked]);

  const checkLikedMusic = async (userId, songId) => {
    try {
      const response = await axios.get(
        `${site.api}/likelist?uid=${userId}&cookie=${cookie}`
      );

      if (response.data.code === 200) {
        const likedMusicIds = response.data.ids;
        const isLiked = likedMusicIds.includes(songId);
        setIsLiked(isLiked);
      } else {
        alert("获取喜欢音乐列表失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const toggleLikeMusic = async () => {
    try {
      setIsLiked(!isLiked); // 直接更新喜欢状态，不等待服务器响应

      const response = await axios.get(`${site.api}/like`, {
        params: {
          id: songId,
          like: !isLiked, // 反转当前的喜欢状态
          cookie: cookie,
        },
      });

      if (response.data.code !== 200) {
        alert("喜欢失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };
  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  const handleRemoveFromPlaylist = (trackId, event) => {
    event.stopPropagation(); // 阻止事件向上传递
    removeFromPlaylist(trackId);
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 truncate">
        <ContextMenuItem className="flex flex-row space-x-2">
          <LazyLoadImage
            src={`${picUrl}?param128y128`}
            effect="blur"
            className="rounded-xl size-12"
          />
          <div className="flex flex-col w-40 truncate">
            <h2 className="text-sm font-medium">{name}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {ar}
            </p>
          </div>
        </ContextMenuItem>
        <Separator className="mb-2" />
        <ContextMenuItem
          className="py-2"
          onClick={() => handleAddToPlaylist(id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
              clipRule="evenodd"
            />
          </svg>
          现在就听
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toggleLikeMusic(id)} className="py-2">
          {isLiked ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              取消喜欢
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
              喜欢歌曲
            </>
          )}
        </ContextMenuItem>
        {songIds.includes(id) && (
          <ContextMenuItem
            onClick={(event) => handleRemoveFromPlaylist(id, event)}
            className="py-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
            从队列中移除
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
