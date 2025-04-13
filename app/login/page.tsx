"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error } = useAuth();
  
  // 获取重定向URL
  const from = searchParams.get("from") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "请填写所有字段",
        description: "邮箱和密码是必填项",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // 登录成功后会自动重定向到首页
    } catch (err) {
      console.error("Login error:", err);
      // 错误处理由 AuthContext 完成
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            登录到知识中心
          </h1>
          <p className="mt-2 text-gray-400">
            输入您的邮箱和密码继续
          </p>
        </div>

        <div className="mt-8 bg-gray-900 p-8 rounded-lg shadow-lg">
          {error && (
            <div className="mb-4 rounded-md bg-red-900 p-4 text-white">
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-white">
                邮箱
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 bg-gray-800 text-white border-gray-700"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  密码
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-gray-800 text-white border-gray-700"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              还没有账号？{" "}
              <Link
                href="/register"
                className="text-fuchsia-400 hover:text-fuchsia-300"
              >
                注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
