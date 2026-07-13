# xingchenxi One-Page Website

这是星沉系官网一页版 v0.1。

## Files

- `index.html`：静态官网页面
- `privacy.html`：隐私说明页面
- `404.html`：静态部署错误页
- `styles.css`：页面样式
- `scripts.js`：首屏动态星系网络
- `assets/`：Logo、favicon 和网站静态资源
- `assets/video/`：官网视频资产
- `assets/posters/`：视频封面图
- `data/daily-brief.json`：Daily Brief 公司动态日志与年度词条星球公开数据
- `data/interviews.json`：Bryn OS 访谈认知资产公开数据
- `daily/`：Daily Brief / Company Log 次级页面，包含年度关键词星球与近期简报滚动屏
- `cognitive-os/`：Bryn OS / 访谈认知库次级页面
- `site.webmanifest`：移动端图标与安装元信息
- `robots.txt`：搜索引擎抓取规则
- `sitemap.xml`：站点地图模板
- `LAUNCH_CHECKLIST.md`：正式上线前检查清单

## Usage

可以直接用浏览器打开：

```text
index.html
```

也可以在本目录启动一个本地静态服务器：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://localhost:4173
```

## Current Content

页面包含：

- Hero / 品牌定位
- 动态星系网络视觉
- Daily Brief / Company Log 公司动态日志入口
- `/daily/` 年度关键词星球与近期简报滚动屏
- Bryn OS / 访谈认知资产入口
- 《沉星禁区》视频原型展示
- 《沉星禁区》五段式视频章节切换
- `/ip/` React + Vite 次级 IP 网站入口
- AI x Knowledge Automation
- 内容语义微型矢量标记系统
- 三个第一阶段战略方向
- 长期系统方向
- 2026-2036 路线图
- 联系与法律主体信息

## Launch Notes

正式公开上线前需要补充：

- 联系邮箱或联系表单
- 域名
- ICP / 备案信息（如使用中国大陆服务器）
- 真实案例或首批服务说明

域名确认后，需要同步替换：

- `robots.txt` 里的 Sitemap 域名
- `sitemap.xml` 里的 URL
- `index.html` / `privacy.html` 的 canonical 与 Open Graph URL
