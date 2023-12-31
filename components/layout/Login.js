import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import cn from "classnames";
import site from "@/lib/site.config";
import axios from "axios";
import { Button } from "../ui/button";
import { MenubarItem } from "../ui/menubar";
import { DashboardIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Separator } from "../ui/separator";
import { useToast } from "@/components/ui/use-toast";

export default function Login({ type }) {
  const { toast } = useToast();
  const router = useRouter();
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [loginMethod, setLoginMethod] = useState("phone"); // 登录方式，默认为手机号登录
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    if (loginMethod === "phone") {
      setCount(3);
    }
    if (loginMethod === "captcha") {
      setCount(4);
    }
  }, [api, loginMethod]);

  const [phone, setPhone] = useState(""); // 手机号
  const [password, setPassword] = useState(""); // 密码
  const [verificationCode, setVerificationCode] = useState(""); // 验证码
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function getLoginStatus(cookie = "") {
    const res = await axios({
      url: `${site.api}/login/status?timestamp=${Date.now()}`,
      method: "post",
      data: {
        cookie,
      },
    });
    return res.data; // 返回获取的用户数据
  }

  async function loginWithPhone() {
    // 使用手机号登录
    const res = await axios({
      url: `${site.api}/login/cellphone?phone=${encodeURIComponent(
        phone
      )}&password=${encodeURIComponent(password)}`,
    });
    // 处理登录结果
    return res; // 返回获取的用户数据
  }

  async function loginWithVerificationCode() {
    // 使用验证码登录
    const res = await axios({
      url: `${site.api}/login/cellphone?phone=${encodeURIComponent(
        phone
      )}&captcha=${encodeURIComponent(verificationCode)}`,
    });
    // 处理登录结果

    return res; // 返回获取的用户数据
  }

  async function sendVerificationCode() {
    try {
      const res = await axios({
        url: `${site.api}/captcha/sent`,
        method: "POST",
        data: {
          phone: phone,
        },
      });

      if (res.data.code === 200) {
        toast({
          variant: "destructive",
          title: "验证码发送成功",
          description: "( •̀ ω •́ )y",
        });
      } else {
        toast({
          variant: "destructive",
          title: "验证码发送失败",
          description: "看来您需要重试一下啦",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "验证码发送失败",
        description: "看来您需要重试一下啦",
      });
    }
    setCountdown(60);
  }

  async function handleLogin() {
    if (loginMethod === "phone") {
      // 手机号登录
      const userData = await loginWithPhone();
      localStorage.setItem("cookie", userData.data.cookie);
      localStorage.setItem("userData", JSON.stringify(userData));
      toast({
        title: "登录成功！",
        description: "( •̀ ω •́ )y",
      });
      router.push("/dashboard");
    } else {
      // 验证码登录
      const userData = await loginWithVerificationCode();
      localStorage.setItem("cookie", userData.data.cookie);
      localStorage.setItem("userData", JSON.stringify(userData));
      toast({
        title: "登录成功！",
        description: "( •̀ ω •́ )y",
      });
      router.push("/dashboard");
    }
  }
  return (
    <Dialog>
      {type === "bar" && (
        <DialogTrigger className="w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          登录
        </DialogTrigger>
      )}
      {type === "sidebar" && (
        <DialogTrigger>
          <Button
            variant="ghost"
            className="px-8 py-2 w-full text-left justify-start"
          >
            <DashboardIcon className="mr-2 size-4" />
            登录
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="p-8 md:p-8 sm:p-16 max-w-xl w-full z-[9999999]">
        <DialogHeader>
          <DialogTitle className="text-balance text-3xl mb-4">
            准备好你的密码，我们快速完成这个流程。
          </DialogTitle>
          <Separator />
          <Carousel
            opts={{
              align: "start",
            }}
            setApi={setApi}
          >
            <CarouselContent>
              <CarouselItem className="basis-5/6 sm:basis-full">
                <DialogDescription className="mt-4">
                  请输入您的手机号
                </DialogDescription>
                <Input
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-3xl mt-2 py-8 font-extrabold"
                />
              </CarouselItem>
              {loginMethod === "phone" && (
                <CarouselItem className="basis-5/6 sm:basis-full">
                  <DialogDescription className="mt-4">
                    请输入您的密码
                  </DialogDescription>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-3xl mt-2 py-8 font-extrabold"
                  />
                </CarouselItem>
              )}
              {loginMethod === "captcha" && (
                <>
                  <CarouselItem className="bais-5/6 sm:basis-full">
                    <DialogDescription className="mt-4">
                      请接收验证码，成功后请进行下一步：
                    </DialogDescription>
                    <Button
                      onClick={sendVerificationCode}
                      disabled={countdown > 0}
                      variant={countdown > 0 ? "secondary" : ""}
                      className="py-8 w-full text-3xl mt-2 font-extrabold"
                    >
                      {countdown > 0 ? `${countdown}s后重试` : "发送验证码"}
                    </Button>
                  </CarouselItem>
                  <CarouselItem className="bais-5/6 sm:basis-full">
                    <DialogDescription className="mt-4">
                      请输入您的验证码
                    </DialogDescription>
                    <Input
                      type="number"
                      className="text-3xl mt-2 py-8 font-extrabold"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </CarouselItem>
                </>
              )}
              <CarouselItem className="basis-5/6 sm:basis-full">
                <DialogDescription className="mt-4">
                  恭喜你，你已完成全部步骤，现在：
                </DialogDescription>
                <Button
                  onClick={handleLogin}
                  className="py-8 w-full text-3xl mt-2 font-extrabold"
                >
                  尝试登录
                </Button>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <DialogDescription className="mt-4 text-center">
            第{current}步， 共{count}步
          </DialogDescription>
          <Separator />
          <div className="mt-4" />
          {loginMethod === "phone" && (
            <DialogDescription
              className="cursor-pointer font-black"
              onClick={() => setLoginMethod("captcha")}
            >
              用验证码登录
            </DialogDescription>
          )}

          {loginMethod === "captcha" && (
            <DialogDescription
              className="cursor-pointer font-black"
              onClick={() => setLoginMethod("phone")}
            >
              用密码登录
            </DialogDescription>
          )}
          <DialogDescription className="mt-2">
            我们不会存储您的任何数据（在云端），您的一切活动只跟网易服务器有关。
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
