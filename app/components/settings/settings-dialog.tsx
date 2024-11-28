import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { User, Settings, Palette, Bell, Plug2, LogOut } from "lucide-react";
import { cn } from "~/lib/utils";
import { Form, useFetcher } from "@remix-run/react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  emailVerified: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

// 定义 fetcher 数据类型
interface VerifyResponse {
  success?: boolean;
  error?: string;
}

type SettingTabId =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "integrations";

interface SettingTab {
  id: SettingTabId;
  icon:
    | typeof User
    | typeof Settings
    | typeof Palette
    | typeof Bell
    | typeof Plug2;
  title: string;
  description: string;
}

// 设置选项配置
const settingTabs: SettingTab[] = [
  {
    id: "profile",
    icon: User,
    title: "个人资料",
    description: "管理您的个人信息和偏好设置",
  },
  {
    id: "account",
    icon: Settings,
    title: "账户设置",
    description: "管理您的账户安全和登录选项",
  },
  // 移除未实现的选项
];

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingTabId>("profile");

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden">
        <div className="flex h-[700px]">
          <SettingsSidebar
            activeTab={activeTab}
            onTabChange={(tab: SettingTabId) => setActiveTab(tab)}
          />
          <SettingsContent activeTab={activeTab} user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 左侧导航组件
interface SettingsSidebarProps {
  activeTab: SettingTabId;
  onTabChange: (tab: SettingTabId) => void;
}

function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="w-[240px] border-r border-border/40 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <h2 className="text-lg font-semibold">设置</h2>
        <p className="text-sm text-muted-foreground">管理您的账户和偏好设置</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {settingTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-lg text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-border/40">
        <Form method="post" action="/logout" replace>
          <button
            type="submit"
            className="flex items-center gap-3 w-full p-3 rounded-lg text-sm transition-colors text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>退出登录</span>
          </button>
        </Form>
      </div>
    </div>
  );
}

// 右侧内容组件
interface SettingsContentProps {
  activeTab: SettingTabId;
  user: User;
}

function SettingsContent({ activeTab, user }: SettingsContentProps) {
  const currentTab = settingTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border/40">
        <h3 className="text-lg font-semibold">{currentTab?.title}</h3>
        <p className="text-sm text-muted-foreground">
          {currentTab?.description}
        </p>
      </div>
      <ScrollArea className="flex-1 p-6">
        <SettingsPanel activeTab={activeTab} user={user} />
      </ScrollArea>
    </div>
  );
}

// 设置面板组件
interface SettingsPanelProps {
  activeTab: SettingTabId;
  user: User;
}

function SettingsPanel({ activeTab, user }: SettingsPanelProps) {
  switch (activeTab) {
    case "profile":
      return <ProfileSettings user={user} />;
    default:
      return <div>开发中...</div>;
  }
}

// 个人资料设置
interface ProfileSettingsProps {
  user: User;
}

function ProfileSettings({ user }: ProfileSettingsProps) {
  const [showVerifySection, setShowVerifySection] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const fetcher = useFetcher<VerifyResponse>();

  const isVerifying = fetcher.state !== "idle";
  const verifyError = fetcher.data?.error;
  const verifySuccess = fetcher.data?.success;

  // 倒计时处理
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user.id || countdown > 0) return;

    // 使用 submit 而不是 fetcher.submit
    const formData = new FormData();
    formData.append("userId", user.id);

    await fetch("/api/verify-code", {
      method: "POST",
      body: formData,
    });

    setCountdown(60);
  };

  // 验证邮箱
  const handleVerifyEmail = () => {
    if (!user.id || !verificationCode) return;

    fetcher.submit(
      {
        userId: user.id,
        code: verificationCode,
      },
      {
        method: "post",
        action: "/api/verify-email",
      }
    );
  };

  // 验证成功后重置状态
  useEffect(() => {
    if (verifySuccess) {
      setShowVerifySection(false);
      setVerificationCode("");
      window.location.reload();
    }
  }, [verifySuccess]);

  return (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">头像</label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500/50 to-violet-500/50 text-white text-xl">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <Button variant="outline" size="sm">
              更改头像
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">用户名</label>
          <Input defaultValue={user.name} />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Input value={user.email} disabled />
                {!user.emailVerified && !showVerifySection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerifySection(true)}
                  >
                    验证邮箱
                  </Button>
                )}
              </div>

              {/* 验证码区域 */}
              {!user.emailVerified && showVerifySection && (
                <div
                  className="p-4 border rounded-lg space-y-4 bg-muted/30"
                  data-verify-section
                >
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">验证码</label>
                        <p className="text-sm text-muted-foreground">
                          验证码将发送至：{user.email}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex gap-2 flex-1">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <Input
                              key={index}
                              type="text"
                              maxLength={1}
                              className="w-10 h-10 text-center text-lg font-medium"
                              value={verificationCode[index] || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  const newCode = verificationCode.split("");
                                  newCode[index] = value;
                                  setVerificationCode(newCode.join(""));
                                  if (value && index < 5) {
                                    const nextInput = document.querySelector(
                                      `input[data-index="${index + 1}"]`
                                    ) as HTMLInputElement;
                                    if (nextInput) nextInput.focus();
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Backspace" &&
                                  !verificationCode[index] &&
                                  index > 0
                                ) {
                                  const prevInput = document.querySelector(
                                    `input[data-index="${index - 1}"]`
                                  ) as HTMLInputElement;
                                  if (prevInput) prevInput.focus();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const paste = e.clipboardData.getData("text");
                                const numbers = paste.match(/\d/g);
                                if (numbers) {
                                  const newCode = numbers.slice(0, 6).join("");
                                  setVerificationCode(newCode);
                                  // 聚焦到最后一个输入框
                                  const lastInput = document.querySelector(
                                    `input[data-index="5"]`
                                  ) as HTMLInputElement;
                                  if (lastInput) lastInput.focus();
                                }
                              }}
                              data-index={index}
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendCode}
                          disabled={isVerifying || countdown > 0}
                          className="shrink-0"
                        >
                          {countdown > 0
                            ? `${countdown}s 后重试`
                            : isVerifying
                            ? "发送中..."
                            : "获取验证码"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {verifyError && (
                    <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
                      {verifyError}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      没有收到验证码？请检查垃圾邮件文件夹
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowVerifySection(false);
                          setVerificationCode("");
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleVerifyEmail}
                        disabled={verificationCode.length !== 6 || isVerifying}
                      >
                        {isVerifying ? "验证中..." : "验证"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!user.emailVerified && (
                <p className="text-xs text-yellow-500">
                  请验证邮箱以使用完整功能
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
