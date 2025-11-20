#!/bin/bash

# 下载 MVVM 流程图到本地
cd /Users/dingxingxing/Desktop/项目记录文档/学习记录文档/bk/vitePressBlog/public

echo "正在下载 MVVM 流程图..."
curl -o mvvm-flow.png "https://img-blog.csdnimg.cn/20190104151402821.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2R3ZnJvc3Q=,size_16,color_FFFFFF,t_70"

if [ -f "mvvm-flow.png" ]; then
    echo "✅ 下载成功！文件已保存到 public/mvvm-flow.png"
    ls -lh mvvm-flow.png
else
    echo "❌ 下载失败，请手动下载"
fi

