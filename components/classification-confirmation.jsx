"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// 类别映射
const CATEGORY_LABELS = {
  articles: '待看文章',
  ideas: '想法',
  tasks: '安排',
  resources: '干货收藏'
};

export default function ClassificationConfirmation({ 
  classification, 
  onConfirm, 
  onCancel 
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(() => {
    // 将分类结果转换为扁平数组，每个项目包含类别信息
    const flatItems = [];
    Object.entries(classification).forEach(([category, categoryItems]) => {
      categoryItems.forEach(item => {
        flatItems.push({
          ...item,
          category
        });
      });
    });
    return flatItems;
  });

  // 更新项目的类别
  const updateItemCategory = (itemId, newCategory) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, category: newCategory } 
          : item
      )
    );
  };

  // 确认分类并保存
  const handleConfirm = async () => {
    try {
      // 将扁平数组转换回分类对象
      const confirmedClassification = {
        articles: [],
        ideas: [],
        tasks: [],
        resources: []
      };
      
      items.forEach(item => {
        const { id, content, category } = item;
        confirmedClassification[category].push({ id, content });
      });
      
      // 调用父组件的确认回调
      await onConfirm(confirmedClassification);
      
      toast({
        title: "分类已确认",
        description: "内容已成功分类并保存",
        variant: "default",
      });
    } catch (error) {
      console.error('Error confirming classification:', error);
      toast({
        title: "保存失败",
        description: "保存分类时出错，请重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">确认分类结果</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={handleConfirm}>确认并保存</Button>
        </div>
      </div>
      
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800">
            <CardTitle>{label}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {items.filter(item => item.category === category).length > 0 ? (
              <div className="space-y-3">
                {items
                  .filter(item => item.category === category)
                  .map(item => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                    >
                      <div className="flex-1 mr-4">
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      </div>
                      <Select 
                        value={item.category}
                        onValueChange={(value) => updateItemCategory(item.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="选择类别" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                }
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                此类别暂无内容
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={handleConfirm}>确认并保存</Button>
      </div>
    </div>
  );
}
