---
layout: home

hero:
  name: "前端技术学习"
  text: ""
  tagline: "时光荏苒，岁月如梭。每一个框架或者库只能陪你走一段路，最终都会逝去。留在你心中的，不是一条一条的语法规则，而是一个一个的思想，这些思想才是推动进步的源泉。"
  image:
    # src: /bg.jpg
    alt: 学习记录
  actions:
    - theme: brand
      text: 语言学习 📚
      link: /Language/
    - theme: alt
      text: 工具学习 🛠️
      link: /Tool/

features:
  - icon: 📝
    title: JavaScript
    details: JavaScript、ES6、ES7-10 等语言特性学习
    link: /Language/JavaScript/JavaScript/
  - icon: 🚀
    title: Node.js
    details: Node 基础、MongoDB、爬虫开发
    link: /Language/Node/Node/
  - icon: 💚
    title: Vue 生态
    details: Vue 基础、MVVM 原理、Vuex 状态管理
    link: /Tool/Vue/Vue_base/
  - icon: 📦
    title: 构建工具
    details: Webpack 打包工具配置与优化
    link: /Tool/Webpack/
  - icon: 🌐
    title: HTTP 工具
    details: Axios 请求库的使用
    link: /Tool/Axios/
  - icon: 🔧
    title: 开发工具
    details: Git 版本控制、SSO 单点登录
    link: /Tool/Git/
---

<style>
.home img:hover {
   transform: scale(1.15)!important;
   transition:all 2s !important;
}
.home img {
   transform: scale(0.95) !important;
   transition: all 2.5s!important;
}
@keyframes myfirst
{
from {opacity: 1;}
to {opacity: 0.1;transform: translateY(-110px);}
}
</style>

