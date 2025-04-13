"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "请填写所有字段",
        description: "所有字段都是必填项",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码长度至少为6个字符",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(email, password);
      // 注册成功后会自动重定向到首页
    } catch (err) {
      console.error("Registration error:", err);
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
            创建新账号
          </h1>
          <p className="mt-2 text-gray-400">
            注册一个新的知识中心账号
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
              <Label htmlFor="password" className="text-white">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-gray-800 text-white border-gray-700"
                required
              />
              <p className="mt-1 text-sm text-gray-400">
                密码长度至少为6个字符
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                确认密码
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              已有账号？{" "}
              <Link
                href="/login"
                className="text-fuchsia-400 hover:text-fuchsia-300"
              >
                登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
