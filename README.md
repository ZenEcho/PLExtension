<p align="center">
  <img alt="logo" src="https://cdn-us.imgs.moe/2023/05/31/64770cc077bfc.png" height="200" />
</p>
 
 # 盘络上传扩展程序

[官网地址](https://fileup.dev/)

### 介绍
- 盘络上传，是一款免费的上传扩展程序提供兰空图床,简单图床,chevereto,阿里云oss,AWS S3,GitHub等程序的文件上传
- 兼容Chromium内核，Gecko内核浏览器；
- 目前支持的上传程序：[兰空图床](https://www.lsky.pro/),[简单图床](https://github.com/icret/EasyImages2.0),[imgurl图床](https://www.imgurl.org/),[chevereto图床](https://chevereto.com/),[hellohao图床](https://hellohao.cn/),[sm.ms图床](https://sm.ms/),[imgur图床](https://imgur.com/),[腾讯云cos](https://cloud.tencent.com/product/cos),[阿里云oss](https://www.aliyun.com/product/oss),[AWS S3](https://aws.amazon.com/cn/s3/),[GitHub](https://github.com/);
- 支持实时预览、图片（跨域）上传、预格式代码/[编辑框插入](https://fileup.dev/#page2/3)。
- 支持浏览器常驻侧边栏，侧边栏拖拽上传，浏览器右键菜单上传，上传页面支持粘贴上传/拖拽上传，均支持本地与url转存;
- 兼容主流的浏览器Chrome，Edge，Firefox；

![Chrome](https://img.shields.io/badge/Chromium-chrome-blue?style=for-the-badge&logo=googlechrome)
![Edge](https://img.shields.io/badge/Chromium-Edge-blue?style=for-the-badge&logo=microsoftedge)
![Firefox](https://img.shields.io/badge/Gecko-Firefox-blue?style=for-the-badge&logo=firefoxbrowser)

-------------

### 功能演示

[演示地址](https://fileup.dev/#page3) (如果检测不到扩展,请鼠标向上滚动再向下回到演示页)

- **粘贴上传**

"粘贴上传"便捷的文件上传功能，支持直接粘贴图片数据、图片链接或本地文件到上传框，实现快速上传。省去了繁琐的选择步骤，只需简单复制并粘贴，即可将文件上传。

- **拖拽上传**

"拖拽上传"是便捷的文件上传方式。只需将文件从本地拖动到指定区域即可完成上传，还可以快速拖拽多个文件或频繁上传文件，提高工作效率，为用户带来便利和舒适的上传体验。

- **右键上传**

"右键上传"是浏览器右键菜单中的便捷文件上传方式。用户只需在网页上对着图片右键点击，选择上传选项，即可完成文件上传。用户可以在浏览网页的同时，快速上传图片。

-------------

### 下载
- Edge：[商店链接](https://microsoftedge.microsoft.com/addons/detail/%E7%9B%98%E7%BB%9C%E4%B8%8A%E4%BC%A0/knmklgmbbbaadnfokcokobnlihdiiloe)
- Chrome：[商店链接](https://chrome.google.com/webstore/detail/%E7%9B%98%E7%BB%9C%E4%B8%8A%E4%BC%A0/lhbncdbejjjbbljkdplddajgmeconcnk)
- Firefox: [商店链接](https://addons.mozilla.org/zh-CN/firefox/addon/%E7%9B%98%E7%BB%9C%E4%B8%8A%E4%BC%A0/)

-------------

### 问题反馈
 [插件交流反馈群](https://t.me/pnglog)

#### 火狐浏览器注意

**火狐浏览器如果想开启侧边栏和编辑框自动插入，请开启存取您在所有网站的数据功能**
![image](https://github.com/ZenEcho/PlExtend/assets/56901101/949459aa-c1d0-4dba-917d-cee94f4249e7)
![image](https://github.com/ZenEcho/PlExtend/assets/56901101/de2a1759-8ead-430e-9084-eba3cd67a867)
![Snipaste_2023-06-05_13-55-12](https://github.com/ZenEcho/PlExtend/assets/56901101/fbc90d41-4cf5-4b7d-890d-6c4478cd1c27)


### 版本更新:

#1.0.9.2更新:

一.新增GitHub上传

二.新增Firefox浏览器支持

三.Chevereto图床新增加相册ID选项

四.Chevereto图床新增加nsfw选项

五.Chevereto图床新增加删除时间选项

六.兰空图床新增加隐私选择

七.兰空图床新增加相册选择

八.新增全局上传支持在线url解析上传

十.新增版本查看按钮（点击查询GitHub上的最新版本）

十一.移除了手势上传功能

#修复:

1.已修复：对象存储上传速度过快导致本地记录失败(解决中)

2.已修复：古腾堡或其他编辑器上传过快，信息插入重复问题

#已知问题

待发现

—————————————

#1.0.9.1更新:

一.新增自动插入功能(默认开启)

二.新增页面插入提示，当页面有”😍盘络“按钮时表示该页面受支持的，”😭盘络“时表示页面受支持但是无法插入。如果没有按钮表示不受支持或按钮初始化失败，具体支持详细查看（https://fileup.dev/#page2/3）

三.修复bug

#已知BUG:

对象存储上传速度过快导致本地记录失败(解决中)

手势上传与全局上传会被鼠标手势插件影响(待解决)

—————————————

1.0.9更新:

一.新增腾讯云对象存储(COS)功能(本地直传,不经服务器)

二.新增阿里云对象存储(OSS)功能(本地直传,不经服务器)

三.新增AWS S3对象存储(S3)并支持S3接口兼容(本地直传,不经服务器)

四.上传记录页面重构，支持对象存储的字符串读取如html,javascript,python,cpp,txt等字符串文本读取,支持MP3,MP4流媒体展示,压缩包,office等文件的识别!

五.腾讯云,阿里云,S3对象存储支持一键设置CORS,其中腾讯云,阿里云支持访问权限设置。

六.优化画圈手势上传逻辑

七.新增对象存储均支持手势和全局以及右键上传！

八.修复已知BUG(真的修复了，但是我又忘了具体是哪个)

#已知BUG:

对象存储上传速度过快导致本地记录失败

手势上传与全局上传会被鼠标手势插件影响

—————————————
