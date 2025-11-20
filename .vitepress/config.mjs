import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '学习记录文档',
  description: '前端技术学习记录',
  
  // Markdown配置
  markdown: {
    // 禁用某些可能导致问题的解析功能
    breaks: false
  },
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '语言', link: '/Language/' },
      { text: '工具', link: '/Tool/' }
    ],
    
    // 侧边栏
    sidebar: {
      '/Language/': [
        {
          text: 'JavaScript',
          items: [
            { text: 'JavaScript基础', link: '/Language/JavaScript/JavaScript/' },
            { text: 'ES6', link: '/Language/JavaScript/ES6/' },
            { text: 'ES7-10', link: '/Language/JavaScript/ES7-10/' }
          ]
        },
        {
          text: 'Node',
          items: [
            { text: 'Node基础', link: '/Language/Node/Node/' },
            { text: 'MongoDB', link: '/Language/Node/MongoDB/' },
            { text: '爬虫', link: '/Language/Node/Reptiles爬虫/' }
          ]
        }
      ],
      '/Tool/': [
        {
          text: 'Vue',
          items: [
            { text: 'Vue基础', link: '/Tool/Vue/Vue_base/' },
            { text: 'Vue MVVM', link: '/Tool/Vue/Vue_mvvm/' },
            { text: 'Vuex', link: '/Tool/Vue/Vuex/' }
          ]
        },
        {
          text: '其他工具',
          items: [
            { text: 'Axios', link: '/Tool/Axios/' },
            { text: 'Webpack', link: '/Tool/Webpack/' },
            { text: 'Git', link: '/Tool/Git/' },
            { text: 'SSO', link: '/Tool/SSO/' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      // { icon: 'github', link: 'https://github.com/dingxingxing' }
    ],
    
    // 页脚
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2022 xiaoyu'
    },
    
    // 搜索
    search: {
      provider: 'local'
    }
  },
  
  // 站点配置
  base: '/',
  
  // 构建输出目录
  outDir: '../dist'
})

