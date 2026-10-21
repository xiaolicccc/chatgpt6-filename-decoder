# ChatGPT Filename Decoder

**[下载最新版 / Download latest release](https://github.com/xiaolicccc/chatgpt6-filename-decoder/releases/latest)**

[中文说明](#中文说明) | [English](#english)

A minimal Chrome extension that fixes percent-encoded UTF-8 download filenames, including filenames from ChatGPT such as `%E4%B8%93%E5%88%A9.docx`.

> **Independent community utility. Not affiliated with or endorsed by OpenAI or Google.**

## 中文说明

部分浏览器下载任务可能将原本的中文文件名保存为 UTF-8 URL 百分号编码，例如：

- 下载文件名：`%E4%B8%93%E5%88%A9.docx`
- 修复后：`专利.docx`

此扩展在 Chrome 确定下载文件名时尝试解码；**仅修改下载文件的保存名称，不修改文件内容。**

### 安装方法

1. 下载本仓库的源代码（`Code → Download ZIP`），或者下载 Releases 中的 ZIP 安装包。
2. 解压到不会随意删除的固定目录。
3. 打开 Chrome 的 `chrome://extensions` 页面，开启 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择直接包含 `manifest.json` 的文件夹。
5. 使用一个此前出现百分号编码文件名的文件重新下载，检查名称是否恢复正常。

> Chrome 无法直接把此仓库的 ZIP 当作扩展安装；请先解压，再加载包含 `manifest.json` 的文件夹。

### 功能与限制

- 对有效的 UTF-8 百分号编码文件名进行解码，解码结果必须包含非 ASCII 字符。
- 不强行处理无效的编码、不改变普通英文或已经正常显示的中文文件名。
- 拒绝解码后包含路径分隔符、控制字符或 Windows 不允许的文件名字符的名称。
- 遇到重名时使用 Chrome 的自动追加序号机制，不覆盖现有文件。
- **仅影响安装后新发起的下载，不会处理历史文件。**
- **不能修复 ChatGPT 网页中的文件预览标题乱码**；此版本只处理浏览器保存文件时的名称。
- 监听所有 Chrome 下载任务，并非只对 ChatGPT 生效。
- 安全的相对下载路径会尽量保留子目录；若 Chrome 提供绝对系统路径，由于无法可靠确定默认下载根目录，修复后可能改存到默认下载目录根部。
- 若同时安装其他重命名下载文件的扩展，可能存在规则冲突。

### 隐私与权限

使用 Chrome `downloads` 权限，以监听下载文件名的确定过程。此版本没有网络请求逻辑，不上传文件，也不读取文件内部内容。

### 开发与测试

安装 Node.js 22 或以上后，在仓库根目录执行 `node --test tests/*.test.cjs`。测试模拟 Chrome 下载文件名事件，不代表真实浏览器的端到端测试。GitHub Actions 在提交和 PR 时自动运行。

### 项目结构

```text
background.js                Chrome download filename listener
tests/background.test.cjs    Mocked download filename regression tests
.github/workflows/tests.yml  GitHub Actions CI
manifest.json                Manifest V3 extension metadata
README.md                    GitHub project documentation
README_安装与说明.txt            Chinese installation guide
```

### 已知事项

本项目针对特定下载命名问题提供客户端解决办法，**不代表 Chrome、ChatGPT 或 GPT-6 存在已被官方确认的特定故障**。已提供 Node.js 模拟测试与 GitHub Actions；仍需在不同 Chrome 版本、下载来源、下载目录设置和其他扩展组合下进行实际兼容性测试。

## English

Some downloads may preserve a UTF-8 URL-encoded filename rather than decoding it. This Manifest V3 extension uses `chrome.downloads.onDeterminingFilename` to suggest the decoded filename for new downloads.

**Install:** Download and extract this repository or the release ZIP, open `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose the folder containing `manifest.json`.

**Scope:** Renames downloaded files only. It does not change document contents, previously downloaded files, or filenames displayed in the ChatGPT web preview. Invalid or unsafe decoded names are ignored. Conflicts with other download-renaming extensions and custom subdirectories may occur.

**Permissions and privacy:** Uses only the `downloads` permission; no network requests or file-content access are implemented.

**Status:** Community workaround; not an official OpenAI or Google product. Automated Node.js mock tests are included; live Chrome/browser compatibility has not been comprehensively tested.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
