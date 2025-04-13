"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { ArrowLeft, Check } from "lucide-react";

interface ClassificationConfirmationProps {
  classification: {
    articles: { id: string; content: string }[];
    ideas: { id: string; content: string }[];
    tasks: { id: string; content: string }[];
    resources: { id: string; content: string }[];
  };
  onConfirm: (classification: any) => void;
  onCancel: () => void;
}

export default function ClassificationConfirmation({
  classification,
  onConfirm,
  onCancel,
}: ClassificationConfirmationProps) {
  // 创建一个包含所有内容项的数组，每项包含内容和初始类别
  const allItems = [
    ...Object.entries(classification).flatMap(([category, items]) =>
      items.map((item) => ({
        id: item.id || crypto.randomUUID(),
        content: item.content,
        originalCategory: category,
        currentCategory: category,
      }))
    ),
  ];

  const [items, setItems] = useState(allItems);

  // 类别名称映射
  const categoryMap: { [key: string]: string } = {
    articles: "待看文章",
    ideas: "想法",
    tasks: "安排",
    resources: "干货收藏",
  };

  // 更新项目的类别
  const updateItemCategory = (itemId: string, newCategory: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, currentCategory: newCategory } : item
      )
    );
  };

  // 确认分类
  const handleConfirm = () => {
    // 将项目按当前类别重新分组
    const result = {
      articles: [],
      ideas: [],
      tasks: [],
      resources: [],
    };

    items.forEach((item) => {
      result[item.currentCategory].push({
        id: item.id,
        content: item.content,
      });
    });

    onConfirm(result);
  };

  // 获取每个类别的项目数量
  const getCategoryCount = (category: string) => {
    return items.filter((item) => item.currentCategory === category).length;
  };

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">确认分类</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回编辑
        </Button>
      </div>

      <div className="mb-4 rounded-md bg-gray-800 p-4">
        <p className="text-gray-300">
          AI已将您的内容分类。请检查并确认每个项目的类别是否正确，如有需要可以调整。
        </p>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {Object.entries(categoryMap).map(([key, name]) => (
          <div
            key={key}
            className="rounded-md bg-gray-800 p-2 text-center"
          >
            <span className="font-medium text-gray-300">{name}</span>
            <div className="mt-1 text-xl font-bold text-white">
              {getCategoryCount(key)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-md bg-gray-800 p-4">
            <div className="mb-3 text-lg text-white">{item.content}</div>
            <Separator className="mb-3 bg-gray-700" />
            <RadioGroup
              value={item.currentCategory}
              onValueChange={(value) => updateItemCategory(item.id, value)}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {Object.entries(categoryMap).map(([key, name]) => (
                <div
                  key={key}
                  className={`flex items-center space-x-2 rounded-md border p-2 ${
                    item.currentCategory === key
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700"
                  }`}
                >
                  <RadioGroupItem
                    value={key}
                    id={`${item.id}-${key}`}
                    className="text-blue-500"
                  />
                  <Label
                    htmlFor={`${item.id}-${key}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      <Button
        onClick={handleConfirm}
        className="mt-6 w-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 py-6 text-xl font-bold text-black hover:opacity-90"
      >
        <Check className="mr-2 h-5 w-5" />
        确认并保存
      </Button>
    </div>
  );
}
