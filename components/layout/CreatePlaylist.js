import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import site from "@/lib/site.config";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export default function CreatePlaylist() {
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [type, setType] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const cookie = localStorage.getItem("cookie");
  const { toast } = useToast();
  const handleCreatePlaylist = async () => {
    try {
      const response = await axios.get(
        `${site.api}/playlist/create?name=${encodeURIComponent(name)}&privacy=${
          privacy ? "10" : "0"
        }&type=${type}&cookie=${cookie}`
      );
      toast({
        title: "歌单创建成功",
        description: "( •̀ ω •́ )y",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "歌单创建失败",
        description: error,
      });
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
              clipRule="evenodd"
            />
          </svg>
          新建歌单
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建歌单</DialogTitle>
          <DialogDescription>
            只需完成以下步骤，而后点击“创建歌单”
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="歌单名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="选择歌单类型"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NORMAL">普通歌单</SelectItem>
            <SelectItem value="VIDEO">视频歌单</SelectItem>
            <SelectItem value="SHARED">共享歌单</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-row space-x-2">
          <Checkbox
            id="privacy"
            checked={privacy}
            onCheckedChange={setPrivacy}
          />
          <Label className="text-sm -mt-0.5" htmlFor="privacy">
            隐私歌单
          </Label>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleCreatePlaylist}>
            创建歌单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
