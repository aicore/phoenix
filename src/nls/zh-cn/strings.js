/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

define({
  "SYSTEM_DEFAULT": "系统默认",
  "PROJECT_BUSY": "项目运营进行中",
  "DUPLICATING": "正在复制 {0}",
  "MOVING": "移动 {0}",
  "COPYING": "正在复制 {0}",
  "DELETING": "正在删除 {0}",
  "RENAMING": "重命名",
  "GENERIC_ERROR": "(错误 {0})",
  "NOT_FOUND_ERR": "未能发现该文件",
  "NOT_READABLE_ERR": "无法读取该文件。",
  "EXCEEDS_MAX_FILE_SIZE": "{APP_NAME} 不能打开大于 {0} MB 的文件。",
  "NO_MODIFICATION_ALLOWED_ERR": "无法修改此目录。",
  "NO_MODIFICATION_ALLOWED_ERR_FILE": "你没有权限做此次修改。",
  "CONTENTS_MODIFIED_ERR": "该文件已经在 {APP_NAME} 之外被修改。",
  "UNSUPPORTED_ENCODING_ERR": "{APP_NAME} 暂时仅支持UTF-8编码的文本文档。",
  "ENCODE_FILE_FAILED_ERR": "{APP_NAME} 无法对文件的内容进行编码。",
  "DECODE_FILE_FAILED_ERR": "{APP_NAME} 无法解码文件的内容。",
  "UNSUPPORTED_UTF16_ENCODING_ERR": "{APP_NAME} 目前不支持 UTF-16 编码的文本文件。",
  "FILE_EXISTS_ERR": "该文件已存在。",
  "FILE": "个文件",
  "FILE_TITLE": "文件",
  "DIRECTORY": "目录",
  "DIRECTORY_TITLE": "目录",
  "DIRECTORY_NAMES_LEDE": "目录名",
  "FILENAMES_LEDE": "文件名",
  "FILENAME": "文件名",
  "DIRECTORY_NAME": "目录名",
  "ERROR_LOADING_PROJECT": "无法加载此项目。",
  "OPEN_DIALOG_ERROR": "显示[打开文件]对话框发生错误。 (错误 {0})",
  "REQUEST_NATIVE_FILE_SYSTEM_ERROR": "打开目录 <span class='dialog-filename'>{0}</span> 发生错误。 (错误 {1})",
  "READ_DIRECTORY_ENTRIES_ERROR": "读取目录 <span class='dialog-filename'>{0}</span> 发生错误。 (错误 {1})",
  "ERROR_OPENING_FILE_TITLE": "打开文件时发生错误",
  "ERROR_OPENING_FILE": "尝试打开文件 <span class='dialog-filename'>{0}</span> 时发生错误。 {1}",
  "ERROR_OPENING_FILES": "尝试打开以下文件发生现错误:",
  "ERROR_RELOADING_FILE_TITLE": "重新加载文件时发生错误",
  "ERROR_RELOADING_FILE": "尝试重新加载文件 <span class='dialog-filename'>{0}</span> 时发生错误。 {1}",
  "ERROR_SAVING_FILE_TITLE": "保存文件时发生错误",
  "ERROR_SAVING_FILE": "尝试保存文件 <span class='dialog-filename'>{0}</span> 时发生错误。 {1}",
  "ERROR_RENAMING_FILE_TITLE": "重命名文件 {0} 失败",
  "ERROR_RENAMING_FILE": "尝试重命名文件 {2} <span class='dialog-filename'>{0}</span> 时发生错误。 {1}",
  "ERROR_RENAMING_NOT_IN_PROJECT": "文件或目录不是已打开项目的一部分。当前只允许重命名项目中的文件。",
  "ERROR_MOVING_FILE_TITLE": "移动 {0} 时出错",
  "ERROR_MOVING_FILE": "尝试移动 {2} {<span class='dialog-filename'>0}</span> 时出错。{1}",
  "ERROR_MOVING_NOT_IN_PROJECT": "无法移动文件/文件夹，因为它们不是当前项目的一部分。",
  "ERROR_DELETING_FILE_TITLE": "删除文件 {0} 失败",
  "ERROR_DELETING_FILE": "尝试删除文件 {2} <span class='dialog-filename'>{0}</span> 时发生错误。 {1}",
  "INVALID_FILENAME_TITLE": "无效文件名: {0}",
  "CANNOT_PASTE_TITLE": "无法粘贴 {0}",
  "ERR_TYPE_PASTE_FAILED": "<span class='dialog-filename'>将 {0} 粘贴到 <span class='dialog-filename'>{1}</span></span> 时出错",
  "CANNOT_DUPLICATE_TITLE": "无法复制",
  "ERR_TYPE_DUPLICATE_FAILED": "复制 <span class='dialog-filename'>{0}</span> 时出错",
  "INVALID_FILENAME_MESSAGE": "{0} 不能以(.)结尾或者包含系统保留字及以下字符：<code class='emphasized'>{1}</code>",
  "ENTRY_WITH_SAME_NAME_EXISTS": "名为 <span class='dialog-filename'>{0}</span> 的文件/文件夹已经存在。",
  "ERROR_CREATING_FILE_TITLE": "创建文件 {0} 出现错误",
  "ERROR_CREATING_FILE": "尝试创建 {0} <span class='dialog-filename'>{1}</span> 时发生错误。 {2}",
  "ERROR_MIXED_DRAGDROP": "无法在打开文件夹的同时打开其他文件",
  "ERROR_KEYMAP_TITLE": "读取用户键映射错误",
  "ERROR_KEYMAP_CORRUPT": "键映射文件不是有效的 JSON 格式。即将打开配置文件以便您修正。",
  "ERROR_LOADING_KEYMAP": "不能打开你的键映射文件，因为它不是 UTF-8 编码的文本文件。",
  "ERROR_RESTRICTED_COMMANDS": "不能将快捷键重新分配给这些命令： {0}",
  "ERROR_RESTRICTED_SHORTCUTS": "不能重新分配这些快捷键： {0}",
  "ERROR_MULTIPLE_SHORTCUTS": "这些命令定义了多个快捷键： {0}",
  "ERROR_DUPLICATE_SHORTCUTS": "这些快捷键上指定了多个命令： {0}",
  "ERROR_INVALID_SHORTCUTS": "这些快捷键是无效的： {0}",
  "ERROR_NONEXISTENT_COMMANDS": "快捷键指向了并不存在的命令： {0}",
  "ERROR_PREFS_CORRUPT_TITLE": "读取配置错误",
  "ERROR_PREFS_CORRUPT": "您的配置文件不是有效的 JSON 格式. 即将打开配置文件以便您修正. 为使更改生效, 您需要重启 {APP_NAME}.",
  "ERROR_PROJ_PREFS_CORRUPT": "您的项目配置文件不是有效的 JSON 格式. 即将打开配置文件以便您修正. 为使更改生效, 您需要重新载入项目.",
  "ERROR_IN_BROWSER_TITLE": "囧! {APP_NAME} 暂无法在浏览器中运行。",
  "ERROR_IN_BROWSER": "{APP_NAME} 是建立在 HTML 上的一个桌面程序, 你可以用它修改本地文件. 可以前往此处下载系统对应的版本<b>github.com/adobe/brackets-shell</b>, 然后重新运行 {APP_NAME}.",
  "ERROR_MAX_FILES_TITLE": "索引文件错误",
  "ERROR_MAX_FILES": "索引文件过多, 可能无法通过索引查找文件。",
  "ERROR_LAUNCHING_BROWSER_TITLE": "启动浏览器失败",
  "ERROR_CANT_FIND_CHROME": "没有找到 Google Chrome 浏览器, 请确定您已安装了 Chrome 浏览器。",
  "ERROR_LAUNCHING_BROWSER": "启动浏览器时发生错误。 (错误 {0})",
  "LIVE_DEVELOPMENT_ERROR_TITLE": "实时预览错误",
  "LIVE_DEVELOPMENT_RELAUNCH_TITLE": "正在连接浏览器",
  "LIVE_DEVELOPMENT_ERROR_MESSAGE": "要使用实时预览, 需要重启 Chrome 并打开远程调试功能。<br /><br />你确定重新启动 Chrome 浏览器, 并且打开远程调试功能吗？",
  "LIVE_DEV_LOADING_ERROR_MESSAGE": "无法加载实时预览页面",
  "LIVE_DEV_NEED_HTML_MESSAGE": "打开一个 HTML 文件或确认项目中包含 index.html 文件以启动实时预览.",
  "LIVE_DEV_NEED_BASEURL_MESSAGE": "实时预览需要一个服务端, 您需要为这个项目指定一个基本 URL 地址。 (如http://127.0.0.1/)",
  "LIVE_DEV_SERVER_NOT_READY_MESSAGE": "试图启动实时预览 HTTP 服务器时出现错误, 请再试一次。",
  "LIVE_DEVELOPMENT_INFO_TITLE": "欢迎使用实时预览！",
  "LIVE_DEVELOPMENT_INFO_MESSAGE": "{APP_NAME} 将通过实时预览连接至你的浏览器. 你的 HTML 文件将在浏览器中预览, 修改你的代码将会即时更新你浏览器中的预览。<br /><br />目前版本的 {APP_NAME} 实时预览只能运行于 <strong>Google Chrome</strong> 浏览器更新实时编辑时的 <strong>CSS 和 HTML 文件</strong>，当你保存了 JavaScript 文件, 实时预览将在浏览器中重新加载它们。<br /><br />(此消息仅会出现一次)",
  "LIVE_DEVELOPMENT_TROUBLESHOOTING": "更多信息, 请参考<a href='{0}' title='{0}'>实时预览连接错误信息</a>。",
  "LIVE_DEV_STATUS_TIP_NOT_CONNECTED": "实时预览",
  "LIVE_DEV_STATUS_TIP_PROGRESS1": "实时预览: 连接中…",
  "LIVE_DEV_STATUS_TIP_PROGRESS2": "实时预览: 初始化…",
  "LIVE_DEV_STATUS_TIP_CONNECTED": "断开实时预览",
  "LIVE_DEV_STATUS_TIP_OUT_OF_SYNC": "实时预览 (保存文件并刷新)",
  "LIVE_DEV_SELECT_FILE_TO_PREVIEW": "选择要实时预览的文件",
  "LIVE_DEV_CLICK_TO_RELOAD_PAGE": "重新加载页面",
  "LIVE_DEV_CLICK_POPOUT": "弹出窗口实时预览到新窗口",
  "LIVE_DEV_CLICK_TO_PIN_UNPIN": "固定在 “取消固定预览” 页面",
  "LIVE_DEV_STATUS_TIP_SYNC_ERROR": "实时预览 (由于语法错误没有更新)",
  "LIVE_DEV_DETACHED_REPLACED_WITH_DEVTOOLS": "由于浏览器开发人员工具已打开, 实时预览已关闭。",
  "LIVE_DEV_DETACHED_TARGET_CLOSED": "由于浏览器中页面已关闭, 实时预览已关闭",
  "LIVE_DEV_NAVIGATED_AWAY": "由于浏览器打开一个不属于本项目的页面, 实时预览已关闭",
  "LIVE_DEV_CLOSED_UNKNOWN_REASON": "未知原因 ({0}) 导致实时预览关闭",
  "SAVE_CLOSE_TITLE": "保存更新",
  "SAVE_CLOSE_MESSAGE": "保存 <span class='dialog-filename'>{0}</span> 文件中所做的修改？",
  "SAVE_CLOSE_MULTI_MESSAGE": "是否保存以下文件的修改？",
  "EXT_MODIFIED_TITLE": "外部文件发生变化",
  "CONFIRM_DELETE_TITLE": "删除确认",
  "CONFIRM_FILE_DELETE": "您确定要删除文件 <span class='dialog-filename'>{0}</span> 吗？",
  "CONFIRM_FOLDER_DELETE": "确认要删除目录 <span class='dialog-filename'>{0}</span>？",
  "FILE_DELETED_TITLE": "文件已删除",
  "EXT_MODIFIED_WARNING": "<span class='dialog-filename'>{0}</span> 已产生了外部修改，<br /><br />是否保存并覆盖外部修改？",
  "EXT_MODIFIED_MESSAGE": "<span class='dialog-filename'>{0}</span> 已产生了外部修改, 但是 {APP_NAME} 中有你未保存的内容，<br /><br />需要保留哪个版本？",
  "EXT_DELETED_MESSAGE": "<span class='dialog-filename'>{0}</span> 已被删除, 但是 {APP_NAME} 有你未保存的内容，<br /><br />是否保存你的修改？",
  "WINDOW_UNLOAD_WARNING": "您确定要导航到其他 URL 并留下括号吗？",
  "WINDOW_UNLOAD_WARNING_WITH_UNSAVED_CHANGES": "你有未保存的更改！您确定要导航到其他 URL 并留下括号吗？",
  "DONE": "完成",
  "OK": "确认",
  "CANCEL": "取消",
  "DONT_SAVE": "不要保存",
  "SAVE": "保存",
  "SAVE_AS": "另存为…",
  "SAVE_AND_OVERWRITE": "覆盖",
  "DELETE": "删除",
  "BUTTON_YES": "是",
  "BUTTON_NO": "否",
  "FIND_MATCH_INDEX": "{1} 条中的 {0} 条",
  "FIND_NO_RESULTS": "未找到匹配项",
  "FIND_QUERY_PLACEHOLDER": "查找…",
  "FIND_HISTORY_MAX_COUNT": "检索历史中的最大搜索项数",
  "REPLACE_PLACEHOLDER": "替换为…",
  "BUTTON_REPLACE_ALL": "全部…",
  "BUTTON_REPLACE_BATCH": "批处理...",
  "BUTTON_REPLACE_ALL_IN_FILES": "替换…",
  "BUTTON_REPLACE": "替换",
  "BUTTON_NEXT": "▶",
  "BUTTON_PREV": "◀",
  "BUTTON_NEXT_HINT": "下一个匹配项",
  "BUTTON_PREV_HINT": "上一个匹配项",
  "BUTTON_CASESENSITIVE_HINT": "区分大小写",
  "BUTTON_REGEXP_HINT": "正则表达式",
  "REPLACE_WITHOUT_UNDO_WARNING_TITLE": "替换(无法撤销)",
  "REPLACE_WITHOUT_UNDO_WARNING": "由于有 {0} 个文件需要修改, {APP_NAME} 将修改磁盘中未打开的文件，<br />这些修改无法撤销。",
  "BUTTON_REPLACE_WITHOUT_UNDO": "替换(无法撤销)",
  "OPEN_FILE": "打开文件",
  "SAVE_FILE_AS": "保存文件",
  "CHOOSE_FOLDER": "请选择一个目录",
  "RELEASE_NOTES": "发行说明",
  "NO_UPDATE_TITLE": "已更新!",
  "NO_UPDATE_MESSAGE": "正在使用最新版本的 {APP_NAME}。",
  "FIND_REPLACE_TITLE_LABEL": "替换",
  "FIND_REPLACE_TITLE_WITH": "为",
  "FIND_TITLE_LABEL": "已找到",
  "FIND_TITLE_SUMMARY": "&mdash; {0} {1} {2} 于 {3}",
  "FIND_NUM_FILES": "{0} {1}",
  "FIND_IN_FILES_SCOPED": "在 <span class='dialog-filename'>{0}</span> 中",
  "FIND_IN_FILES_NO_SCOPE": "在项目中",
  "FIND_IN_FILES_ZERO_FILES": "筛选条件排除了所有文件 {0}",
  "FIND_IN_FILES_FILE": "个文件",
  "FIND_IN_FILES_FILES": "个文件",
  "FIND_IN_FILES_MATCH": "个匹配",
  "FIND_IN_FILES_MATCHES": "个匹配",
  "FIND_IN_FILES_MORE_THAN": "超过 ",
  "FIND_IN_FILES_PAGING": "{0}&mdash;{1}",
  "FIND_IN_FILES_FILE_PATH": "<span class='dialog-filename'>{0}</span> {2} <span class='dialog-path'>{1}</span>",
  "FIND_IN_FILES_EXPAND_COLLAPSE": "按住 Ctrl/Cmd 键以便展开/折叠全部结果",
  "FIND_IN_FILES_INDEXING": "Indexing for Instant Search…",
  "FIND_IN_FILES_INDEXING_PROGRESS": "正在索引 {0} 个 {1} 个文件以进行即时搜索...",
  "REPLACE_IN_FILES_ERRORS_TITLE": "替换出现错误",
  "REPLACE_IN_FILES_ERRORS": "以下文件未被修改，可能是搜索后发生变更或无法写入。",
  "ERROR_FETCHING_UPDATE_INFO_TITLE": "获取更新信息失败",
  "ERROR_FETCHING_UPDATE_INFO_MSG": "无法从服务器获取最新的更新信息. 请确认你的电脑已经连接互联网, 然后再次尝试重新获取！",
  "NEW_FILE_FILTER": "新建排除规则…",
  "CLEAR_FILE_FILTER": "不排除文件",
  "NO_FILE_FILTER": "没有文件被排除",
  "EXCLUDE_FILE_FILTER": "排除 {0}",
  "EDIT_FILE_FILTER": "编辑…",
  "FILE_FILTER_DIALOG": "编辑过滤规则",
  "FILE_FILTER_INSTRUCTIONS": "根据下列匹配规则排除文件或文件夹, 匹配规则可以是文件名或其子串, 或使用 <a href='{0}' title='{0}'>globs</a>，每行输入一条规则。",
  "FILTER_NAME_PLACEHOLDER": "命名过滤规则 (可选)",
  "FILTER_NAME_REMAINING": "还剩 {0} 个字符",
  "FILE_FILTER_CLIPPED_SUFFIX": "及另外 {0} 类",
  "FILTER_COUNTING_FILES": "统计文件数目…",
  "FILTER_FILE_COUNT": "Allows {0} of {1} files {2}",
  "FILTER_FILE_COUNT_ALL": "Allows all {0} files {1}",
  "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "当前光标位置没有可用的快速编辑",
  "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "CSS 快速编辑: 将光标放在单一class名称上",
  "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "CSS 快速编辑: class属性不完整",
  "ERROR_CSSQUICKEDIT_IDNOTFOUND": "CSS 快速编辑: id属性不完整",
  "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "CSS 快速编辑: 将光标放在标签,、class 或 id上",
  "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "CSS 计时函数快速编辑: 语法无效",
  "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "JS 快速编辑: 将光标放在函数名称上",
  "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "当前光标位置没有可用的快速文件",
  "PROJECT_LOADING": "载入中…",
  "UNTITLED": "无标题",
  "WORKING_FILES": "工作区",
  "TOP": "上",
  "BOTTOM": "下",
  "LEFT": "左",
  "RIGHT": "右",
  "CMD_SPLITVIEW_NONE": "单窗口",
  "CMD_SPLITVIEW_VERTICAL": "垂直分割",
  "CMD_SPLITVIEW_HORIZONTAL": "水平分割",
  "SPLITVIEW_MENU_TOOLTIP": "垂直/水平分割编辑器窗口",
  "GEAR_MENU_TOOLTIP": "配置工作区",
  "SPLITVIEW_INFO_TITLE": "已经打开",
  "SPLITVIEW_MULTIPANE_WARNING": "该文件已经在编辑器的另一个窗格中打开。{APP_NAME} 后续会加上同文件多窗格打开的支持。在此之前，文件只会显示在已打开的窗格中。<br /><br />（本信息只显示一次。）",
  "STATUSBAR_CURSOR_POSITION": "行 {0}, 列 {1}",
  "STATUSBAR_SELECTION_CH_SINGULAR": " — 已选中 {0} 列",
  "STATUSBAR_SELECTION_CH_PLURAL": " — 已选中 {0} 列",
  "STATUSBAR_SELECTION_LINE_SINGULAR": " — 已选中 {0} 行",
  "STATUSBAR_SELECTION_LINE_PLURAL": " — 已选中 {0} 行",
  "STATUSBAR_SELECTION_MULTIPLE": " — {0} 处选择",
  "STATUSBAR_INDENT_TOOLTIP_SPACES": "点击切换缩进为空格",
  "STATUSBAR_INDENT_TOOLTIP_TABS": "点击切换缩进为Tab",
  "STATUSBAR_INDENT_SIZE_TOOLTIP_SPACES": "点击修改缩进的空格长度",
  "STATUSBAR_INDENT_SIZE_TOOLTIP_TABS": "点击修改缩进的Tab长度",
  "STATUSBAR_SPACES": "空格长度:",
  "STATUSBAR_TAB_SIZE": "Tab 长度:",
  "STATUSBAR_LINE_COUNT_SINGULAR": "— {0} 行",
  "STATUSBAR_LINE_COUNT_PLURAL": "— {0} 行",
  "STATUSBAR_USER_EXTENSIONS_DISABLED": "扩展已禁用",
  "STATUSBAR_INSERT": "插入",
  "STATUSBAR_OVERWRITE": "改写",
  "STATUSBAR_INSOVR_TOOLTIP": "点击切换光标的插入 (INS) 和改写 (OVR) 模式",
  "STATUSBAR_LANG_TOOLTIP": "点击更改文件类型",
  "STATUSBAR_CODE_INSPECTION_TOOLTIP": "{0}。点击打开关闭报告面板",
  "STATUSBAR_DEFAULT_LANG": "(默认)",
  "STATUSBAR_SET_DEFAULT_LANG": "设置为 .{0} 的缺省",
  "STATUSBAR_ENCODING_TOOLTIP": "选择编码",
  "ERRORS_PANEL_TITLE_MULTIPLE": "{0} 问题",
  "SINGLE_ERROR": "1个 {0} 问题",
  "MULTIPLE_ERRORS": "{1}个 {0} 问题",
  "NO_ERRORS": "未发现 {0} 问题 - 加油！",
  "NO_ERRORS_MULTIPLE_PROVIDER": "未发现问题 - 加油！",
  "LINT_DISABLED": "JSLint 已被禁用或者无法在此文件工作。",
  "NO_LINT_AVAILABLE": "{0} 没有可用检查器",
  "NOTHING_TO_LINT": "没有可检查文件",
  "LINTER_TIMED_OUT": "{0} 等待 {1} ms 后超时",
  "LINTER_FAILED": "{0} 已终止，错误：{1}",
  "FILE_MENU": "文件",
  "CMD_FILE_NEW_UNTITLED": "新建",
  "CMD_FILE_NEW": "新建文件",
  "CMD_FILE_DUPLICATE": "创建副本",
  "CMD_FILE_CUT": "剪切",
  "CMD_FILE_COPY": "复制",
  "CMD_FILE_COPY_PATH": "复制路径",
  "CMD_FILE_PASTE": "粘贴",
  "CMD_PROJECT_NEW": "新项目",
  "CMD_FILE_NEW_FOLDER": "新建目录",
  "CMD_FILE_OPEN": "打开…",
  "CMD_RECENT_FILES_OPEN": "打开最近",
  "CMD_ADD_TO_WORKING_SET": "添加至工作集合",
  "CMD_OPEN_DROPPED_FILES": "打开拖放的文件",
  "CMD_OPEN_FOLDER": "打开目录…",
  "CMD_FILE_CLOSE": "关闭",
  "CMD_FILE_CLOSE_ALL": "全部关闭",
  "CMD_FILE_CLOSE_LIST": "关闭列表中的文件",
  "CMD_FILE_CLOSE_OTHERS": "关闭其他文件",
  "CMD_FILE_CLOSE_ABOVE": "关闭上面的其他文件",
  "CMD_FILE_CLOSE_BELOW": "关闭下面的其他文件",
  "CMD_FILE_SAVE": "保存",
  "CMD_FILE_SAVE_ALL": "全部保存",
  "CMD_FILE_SAVE_AS": "另存为…",
  "CMD_LIVE_FILE_PREVIEW": "实时预览",
  "CMD_TOGGLE_LIVE_PREVIEW_MB_MODE": "开启实验性实时预览",
  "CMD_RELOAD_LIVE_PREVIEW": "强制实时预览重新加载",
  "CMD_PROJECT_SETTINGS": "项目设置…",
  "CMD_FILE_RENAME": "重命名",
  "CMD_FILE_DELETE": "删除",
  "CMD_INSTALL_EXTENSION": "安装扩展…",
  "CMD_EXTENSION_MANAGER": "扩展管理器…",
  "CMD_FILE_REFRESH": "刷新文件列表",
  "CMD_FILE_SHOW_FOLDERS_FIRST": "先对文件夹进行排序",
  "CMD_QUIT": "退出",
  "CMD_EXIT": "退出",
  "EDIT_MENU": "编辑",
  "CMD_UNDO": "撤销",
  "CMD_REDO": "重做",
  "CMD_CUT": "剪切",
  "CMD_COPY": "复制",
  "CMD_PASTE": "粘贴",
  "CMD_SELECT_ALL": "全选",
  "CMD_SELECT_LINE": "选中当前行",
  "CMD_SPLIT_SEL_INTO_LINES": "将选中内容拆分至多行",
  "CMD_ADD_CUR_TO_NEXT_LINE": "将下一行添加至选中内容",
  "CMD_ADD_CUR_TO_PREV_LINE": "将上一行添加至选中内容",
  "CMD_INDENT": "增加行缩进",
  "CMD_UNINDENT": "减少行缩进",
  "CMD_DUPLICATE": "创建副本",
  "CMD_DELETE_LINES": "删除当前行",
  "CMD_COMMENT": "注释当前行",
  "CMD_BLOCK_COMMENT": "注释选中内容",
  "CMD_LINE_UP": "移到下一行",
  "CMD_LINE_DOWN": "移到上一行",
  "CMD_OPEN_LINE_ABOVE": "在上方插入新行",
  "CMD_OPEN_LINE_BELOW": "在下方插入新行",
  "CMD_TOGGLE_CLOSE_BRACKETS": "括号自动补全",
  "CMD_SHOW_CODE_HINTS": "显示代码提示",
  "CMD_BEAUTIFY_CODE": "美化代码",
  "CMD_BEAUTIFY_CODE_ON_SAVE": "保存后美化代码",
  "FIND_MENU": "查找",
  "CMD_FIND": "查找",
  "CMD_FIND_NEXT": "查找下一个",
  "CMD_FIND_PREVIOUS": "查找上一个",
  "CMD_FIND_ALL_AND_SELECT": "查找全部并选中",
  "CMD_ADD_NEXT_MATCH": "将下一项匹配添加至选中内容",
  "CMD_SKIP_CURRENT_MATCH": "跳过并添加下一项匹配",
  "CMD_FIND_IN_FILES": "在文件中查找",
  "CMD_FIND_IN_SUBTREE": "在该位置查找…",
  "CMD_REPLACE": "替换",
  "CMD_REPLACE_IN_FILES": "在文件中替换",
  "CMD_REPLACE_IN_SUBTREE": "在该位置替换…",
  "VIEW_MENU": "视图",
  "CMD_HIDE_SIDEBAR": "隐藏边栏",
  "CMD_SHOW_SIDEBAR": "显示边栏",
  "CMD_TOGGLE_SIDEBAR": "显示/隐藏边栏",
  "CMD_TOGGLE_PANELS": "显示/隐藏面板",
  "CMD_TOGGLE_PURE_CODE": "无干扰模式",
  "CMD_INCREASE_FONT_SIZE": "放大编辑器字体",
  "CMD_DECREASE_FONT_SIZE": "缩小编辑器字体",
  "CMD_RESTORE_FONT_SIZE": "恢复编辑器默认字体",
  "CMD_SCROLL_LINE_UP": "向上滚动",
  "CMD_SCROLL_LINE_DOWN": "向下滚动",
  "CMD_TOGGLE_LINE_NUMBERS": "显示行号",
  "CMD_TOGGLE_ACTIVE_LINE": "高亮当前行",
  "CMD_TOGGLE_WORD_WRAP": "自动换行",
  "CMD_LIVE_HIGHLIGHT": "实时预览高亮",
  "CMD_VIEW_TOGGLE_INSPECTION": "保存时检查文件",
  "CMD_WORKINGSET_SORT_BY_ADDED": "根据添加时间排序",
  "CMD_WORKINGSET_SORT_BY_NAME": "根据名称排序",
  "CMD_WORKINGSET_SORT_BY_TYPE": "根据类型排序",
  "CMD_WORKING_SORT_TOGGLE_AUTO": "自动排序",
  "CMD_THEMES": "主题…",
  "CMD_TOGGLE_SEARCH_AUTOHIDE": "自动关闭搜索",
  "NAVIGATE_MENU": "导航",
  "CMD_QUICK_OPEN": "打开快速导航",
  "CMD_GOTO_LINE": "转到某行",
  "CMD_GOTO_DEFINITION": "转到定义",
  "CMD_GOTO_DEFINITION_PROJECT": "在项目中快速查找定义",
  "CMD_GOTO_FIRST_PROBLEM": "转到第一个错误/警告",
  "CMD_TOGGLE_QUICK_EDIT": "快速编辑",
  "CMD_TOGGLE_QUICK_DOCS": "快速文档",
  "CMD_QUICK_EDIT_PREV_MATCH": "上一个匹配项",
  "CMD_QUICK_EDIT_NEXT_MATCH": "下一个匹配项",
  "CMD_CSS_QUICK_EDIT_NEW_RULE": "新 CSS 规则",
  "CMD_NEXT_DOC": "下一个文件",
  "CMD_PREV_DOC": "上一个文件",
  "CMD_NAVIGATE_BACKWARD": "向后导航",
  "CMD_NAVIGATE_FORWARD": "向前导航",
  "CMD_NEXT_DOC_LIST_ORDER": "列表中下一个文件",
  "CMD_PREV_DOC_LIST_ORDER": "列表中上一个文件",
  "CMD_SHOW_IN_TREE": "在侧边栏显示",
  "CMD_SHOW_IN_EXPLORER": "在资源管理器中显示",
  "CMD_SHOW_IN_FINDER": "在 Finder 中显示",
  "CMD_SHOW_IN_OS": "打开文件所在目录",
  "CMD_SWITCH_PANE_FOCUS": "切换窗格焦点",
  "CMD_OPEN_VFS": "打开虚拟文件系统",
  "CMD_OPEN_VIRTUAL_SERVER": "打开虚拟服务器",
  "HELP_MENU": "帮助",
  "CMD_CHECK_FOR_UPDATE": "检查更新",
  "CMD_HOW_TO_USE_BRACKETS": "如何使用 {APP_NAME}",
  "CMD_SUPPORT": "{APP_NAME} 支持",
  "CMD_SUGGEST": "推荐功能",
  "CMD_RELEASE_NOTES": "发行说明",
  "CMD_GET_INVOLVED": "参与",
  "CMD_SHOW_EXTENSIONS_FOLDER": "显示扩展目录",
  "CMD_HEALTH_DATA_STATISTICS": "健康报告",
  "CMD_HOMEPAGE": "{APP_NAME} 主页",
  "CMD_TWITTER": "在 Twitter 上 {TWITTER_NAME}",
  "CMD_ABOUT": "关于 {APP_TITLE}",
  "CMD_OPEN_PREFERENCES": "打开配置文件",
  "CMD_OPEN_KEYMAP": "打开用户键映射",
  "EXPERIMENTAL_BUILD": "体验版",
  "RELEASE_BUILD": "发布版",
  "DEVELOPMENT_BUILD": "开发版",
  "PRERELEASE_BUILD": "预发行版本",
  "RELOAD_FROM_DISK": "重新从硬盘中加载",
  "KEEP_CHANGES_IN_EDITOR": "保留编辑器中的修改",
  "CLOSE_DONT_SAVE": "放弃保存并关闭",
  "RELAUNCH_CHROME": "重新运行 Chrome",
  "ABOUT": "关于",
  "CLOSE": "关闭",
  "ABOUT_TEXT_LINE1": "发布 {VERSION_MAJOR}。{VERSION_MINOR} {BUILD_TYPE} {版本}",
  "ABOUT_TEXT_BUILD_TIMESTAMP": "构建时间戳： ",
  "ABOUT_TEXT_LINE3": "我们使用的第三方库-<a href='https://github.com/phcode-dev/phoenix/tree/main/src/thirdparty/licences'>许可和归属</a>。 ",
  "ABOUT_TEXT_LINE4": "文档和来源<a href='https://github.com/phcode-dev/phoenix/'>网址为 https://github.com/phcode-dev/phoenix/</a>",
  "ABOUT_TEXT_LINE5": "使用 ❤ 和 JavaScript 制作者：",
  "ABOUT_TEXT_LINE6": "很多人（但我们现在在加载这些数据时遇到了问题）。",
  "ABOUT_TEXT_MDN_DOCS": "MDN 文档和图形 logo 遵循<a href='{MDN_DOCS_LICENSE}'>署名-相同方式共享 3.0 未本地化</a>协议。",
  "UPDATE_NOTIFICATION_TOOLTIP": "有一个新版本的 {APP_NAME}! 点此查看详情。",
  "UPDATE_AVAILABLE_TITLE": "可用的更新",
  "UPDATE_MESSAGE": "有一个新版本的 {APP_NAME}，增加了一些功能：",
  "GET_IT_NOW": "马上获取！",
  "PROJECT_SETTINGS_TITLE": "项目设置: {0}",
  "PROJECT_SETTING_BASE_URL": "实时预览的根目录地址",
  "PROJECT_SETTING_BASE_URL_HINT": "使用本地服务器, 并指定一个URL。 例如: http://localhost:8000/",
  "BASEURL_ERROR_INVALID_PROTOCOL": "实时预览不支持此协议 {0} &mdash;请使用 http: 或 https: .",
  "BASEURL_ERROR_SEARCH_DISALLOWED": "地址不能包含搜索参数如 \"{0}\".",
  "BASEURL_ERROR_HASH_DISALLOWED": "地址不能包含哈希如 \"{0}\".",
  "BASEURL_ERROR_INVALID_CHAR": "特殊字符 '{0}' 必须 %-encoded.",
  "BASEURL_ERROR_UNKNOWN_ERROR": "地址解析错误, 请确认地址格式",
  "EMPTY_VIEW_HEADER": "<em>保持此窗格的焦点，打开文件</em>",
  "FLIPVIEW_BTN_TOOLTIP": "将此视图翻转到 {0} 面板",
  "CURRENT_THEME": "当前主题",
  "USE_THEME_SCROLLBARS": "使用主题自带滚动条",
  "FONT_SIZE": "字号",
  "FONT_FAMILY": "字体",
  "THEMES_SETTINGS": "主题设置",
  "BUTTON_NEW_RULE": "新 CSS 规则",
  "INSTALL": "安装",
  "UPDATE": "升级",
  "REMOVE": "移除",
  "DISABLE": "禁用",
  "ENABLE": "启用",
  "OVERWRITE": "覆盖",
  "CANT_REMOVE_DEV": "\"dev\" 文件夹中扩展必须手动删除。",
  "CANT_UPDATE": "升级与当前版本的 {APP_NAME} 不兼容。",
  "CANT_UPDATE_DEV": "\"dev\" 文件夹中的扩展无法自动升级。",
  "INSTALL_EXTENSION_TITLE": "安装扩展",
  "UPDATE_EXTENSION_TITLE": "升级扩展",
  "INSTALL_EXTENSION_LABEL": "扩展包地址",
  "INSTALL_EXTENSION_HINT": "填写扩展包的 zip 文件或 GitHub repo 的链接地址",
  "INSTALLING_FROM": "正在从 {0} 安装扩展…",
  "INSTALL_SUCCEEDED": "安装成功！",
  "INSTALL_FAILED": "安装失败.",
  "CANCELING_INSTALL": "正在取消…",
  "CANCELING_HUNG": "取消安装需要很长时间. 可能出现了内部错误。",
  "INSTALL_CANCELED": "安装已取消。",
  "VIEW_COMPLETE_DESCRIPTION": "查看完整说明",
  "VIEW_TRUNCATED_DESCRIPTION": "查看简短说明",
  "SORT_EXTENSION_METHOD": "使用 DownloadCount 或发布日期对扩展进行排序",
  "INVALID_ZIP_FILE": "下载的内容不是一个有效的 ZIP 文件。",
  "MISSING_PACKAGE_JSON": "该软件包没有 package.json 文件。",
  "INVALID_PACKAGE_JSON": "扩展包中的 Package.json 不存在。(错误: {0})",
  "MISSING_PACKAGE_NAME": "扩展包中的 Package.json 未指定扩展包名称。",
  "BAD_PACKAGE_NAME": "{0} 是一个无效扩展包名。",
  "MISSING_PACKAGE_VERSION": "扩展包中的 Package.json 未指定扩展包版本。",
  "INVALID_VERSION_NUMBER": "扩展包版本号 ({0}) 无效。",
  "INVALID_BRACKETS_VERSION": "{APP_NAME} 兼容性字串 ({0}) 无效。",
  "DISALLOWED_WORDS": "({1}) 不允许在 {0} 中出现。",
  "NPM_INSTALL_FAILED": "npm 安装命令失败：{0}",
  "API_NOT_COMPATIBLE": "这个扩展包不兼容当前版本的 {APP_NAME}. 将安装至 Disabled 扩展文件夹中。",
  "MISSING_MAIN": "扩展包遗失 main.js 文件.",
  "EXTENSION_ALREADY_INSTALLED": "安装这个扩展将会覆盖先前的版本, 覆盖旧版本吗？",
  "EXTENSION_SAME_VERSION": "已安装相同版本的扩展. 覆盖已存在的安装吗？",
  "EXTENSION_OLDER_VERSION": "扩展包版本 {0} 低于已安装版本 ({1})， 覆盖已存在的安装吗？",
  "DOWNLOAD_ID_IN_USE": "内部错误: 该下载ID已被使用。",
  "NO_SERVER_RESPONSE": "无法连接到服务器。",
  "BAD_HTTP_STATUS": "未在服务器上发现该文件 (HTTP {0})。",
  "CANNOT_WRITE_TEMP": "无法保存下载文件到临时文件。",
  "ERROR_LOADING": "扩展程序启动时遇到一个错误。",
  "MALFORMED_URL": "无效的链接地址，请检查输入是否有误。",
  "UNSUPPORTED_PROTOCOL": "需要一个 http 或 https 协议的地址。",
  "UNKNOWN_ERROR": "未知内部错误。",
  "EXTENSION_MANAGER_TITLE": "扩展管理器",
  "EXTENSION_MANAGER_ERROR_LOAD": "无法连接到扩展仓库。请稍后重试。",
  "INSTALL_EXTENSION_DRAG": "拖拽 .zip 到此处或者",
  "INSTALL_EXTENSION_DROP": "Drop .zip to install",
  "INSTALL_EXTENSION_DROP_ERROR": "安装/更新由于以下错误终止:",
  "INSTALL_FROM_URL": "从 URL 安装…",
  "INSTALL_EXTENSION_VALIDATING": "验证中...…",
  "EXTENSION_AUTHOR": "作者",
  "EXTENSION_DATE": "日期",
  "EXTENSION_INCOMPATIBLE_NEWER": "这个扩展需要更新版本的 {APP_NAME}。",
  "EXTENSION_INCOMPATIBLE_OLDER": "这个扩展目前只能在旧版本的 {APP_NAME} 上运行。",
  "EXTENSION_LATEST_INCOMPATIBLE_NEWER": "扩展版本为 {0} 需要一个更新版本的 {APP_NAME}，但你可以安装旧版本的扩展 {1}。",
  "EXTENSION_LATEST_INCOMPATIBLE_OLDER": "扩展版本为 {0} 需要一个更旧版本的 {APP_NAME}，但你可以安装旧版本的扩展 {1}。",
  "EXTENSION_NO_DESCRIPTION": "没有描述",
  "EXTENSION_MORE_INFO": "更多信息...",
  "EXTENSION_ERROR": "扩展错误",
  "EXTENSION_KEYWORDS": "关键词",
  "EXTENSION_TRANSLATED_USER_LANG": "翻译为{0} , 包括你所使用的语言",
  "EXTENSION_TRANSLATED_GENERAL": "翻译为 {0} ",
  "EXTENSION_TRANSLATED_LANGS": "该扩展已被翻译为以下语言: {0}",
  "EXTENSION_INSTALLED": "已安装",
  "EXTENSION_UPDATE_INSTALLED": "此扩展的更新已下载, 将在重启 {APP_NAME} 后安装。",
  "EXTENSION_SEARCH_PLACEHOLDER": "搜索",
  "EXTENSION_MORE_INFO_LINK": "更多",
  "BROWSE_EXTENSIONS": "浏览扩展",
  "EXTENSION_MANAGER_REMOVE": "移除扩展",
  "EXTENSION_MANAGER_REMOVE_ERROR": "无法移除一个或多个扩展: {0}. {APP_NAME} 仍会重新加载。",
  "EXTENSION_MANAGER_UPDATE": "升级扩展",
  "EXTENSION_MANAGER_UPDATE_ERROR": "无法升级一个或多个扩展: {0}. {APP_NAME} 仍会重新加载。",
  "EXTENSION_MANAGER_DISABLE": "禁用扩展",
  "EXTENSION_MANAGER_DISABLE_ERROR": "无法禁用一个或多个扩展: {0}. {APP_NAME} 仍会重新加载。",
  "MARKED_FOR_REMOVAL": "标记为删除",
  "UNDO_REMOVE": "撤销",
  "MARKED_FOR_UPDATE": "标记为升级",
  "UNDO_UPDATE": "撤销",
  "MARKED_FOR_DISABLING": "标记为禁用",
  "UNDO_DISABLE": "撤销",
  "CHANGE_AND_RELOAD_TITLE": "扩展更改",
  "CHANGE_AND_RELOAD_MESSAGE": "安装或移除已标记的扩展, 需要退出并重启 {APP_NAME}， 请保存未保存的更改。",
  "REMOVE_AND_RELOAD": "移除扩展并退出重启",
  "CHANGE_AND_RELOAD": "更改扩展并退出重启",
  "UPDATE_AND_RELOAD": "升级扩展并退出重启",
  "DISABLE_AND_RELOAD": "禁用扩展并退出重启",
  "PROCESSING_EXTENSIONS": "正在处理扩展的变更…",
  "EXTENSION_NOT_INSTALLED": "无法移除扩展 {0} 其并未被安装.",
  "NO_EXTENSIONS": "还没有安装扩展。<br>点击上方可用的标签开始安装。",
  "NO_EXTENSION_MATCHES": "没有找到相符的扩展。",
  "REGISTRY_SANITY_CHECK_WARNING": "小心来自未知源的扩展。",
  "EXTENSIONS_INSTALLED_TITLE": "已安装",
  "EXTENSIONS_DEFAULT_TITLE": "默认",
  "EXTENSIONS_AVAILABLE_TITLE": "可获取",
  "EXTENSIONS_THEMES_TITLE": "主题",
  "EXTENSIONS_UPDATES_TITLE": "升级",
  "EXTENSIONS_LAST_UPDATED": "上次更新时间",
  "EXTENSIONS_DOWNLOADS": "下载内容",
  "INLINE_EDITOR_NO_MATCHES": "未找到匹配项。",
  "INLINE_EDITOR_HIDDEN_MATCHES": "所有匹配项已折叠。展开右侧列出的文件以查看匹配项。",
  "CSS_QUICK_EDIT_NO_MATCHES": "符合选择的 CSS 规则不存在。<br> 点击 \"新 CSS 规则\" 来创建。",
  "CSS_QUICK_EDIT_NO_STYLESHEETS": "您的项目中没有样式表。<br>建立一个来添加 CSS 规则。",
  "IMAGE_VIEWER_LARGEST_ICON": "最大化",
  "UNIT_PIXELS": "像素",
  "DEBUG_MENU": "调试",
  "ERRORS": "错误",
  "CMD_SHOW_DEV_TOOLS": "显示开发者工具",
  "CMD_REFRESH_WINDOW": "以带扩展模式重启",
  "CMD_RELOAD_WITHOUT_USER_EXTS": "以无扩展模式重启",
  "CMD_NEW_BRACKETS_WINDOW": "新建一个 {APP_NAME} 窗口",
  "CMD_LAUNCH_SCRIPT_MAC": "安装命令行快捷方式",
  "CMD_SWITCH_LANGUAGE": "切换语言",
  "CMD_RUN_UNIT_TESTS": "运行测试",
  "CMD_SHOW_PERF_DATA": "显示性能数据",
  "CMD_ENABLE_LOGGING": "启用详细日志",
  "CMD_OPEN_BRACKETS_SOURCE": "打开 Brackets 源码",
  "CREATING_LAUNCH_SCRIPT_TITLE": "{APP_NAME} 命令行快捷方式",
  "ERROR_CREATING_LAUNCH_SCRIPT": "安装命令行快捷方式时发生错误。 请尝试<a href='https://github.com/adobe/brackets/wiki/Command-Line-Arguments#troubleshooting'>这些故障排除建议</a>.<br/><br/>原因: {0}",
  "ERROR_CLTOOLS_RMFAILED": "无法移除已存在的 <code>/usr/local/bin/brackets</code> 符号链接.",
  "ERROR_CLTOOLS_MKDIRFAILED": "无法创建 <code>/usr/local/bin</code> 目录.",
  "ERROR_CLTOOLS_LNFAILED": "无法创建 <code>/usr/local/bin/brackets</code> 符号链接.",
  "ERROR_CLTOOLS_SERVFAILED": "内部错误.",
  "ERROR_CLTOOLS_NOTSUPPORTED": "该系统不支持命令行快捷方式.",
  "LAUNCH_SCRIPT_CREATE_SUCCESS": "成功! 现在你可以通过这样的命令简单地启动 {APP_NAME} 了: <code>brackets myFile.txt</code> 打开文件, <code>brackets myFolder</code> 切换项目, <br/><br/><a href='https://github.com/adobe/brackets/wiki/Command-Line-Arguments'>点击此处</a>了解更多 {APP_NAME} 命令行的使用方法.",
  "LANGUAGE_TITLE": "切换语言",
  "LANGUAGE_MESSAGE": "请从列表中选择所需的语言:",
  "LANGUAGE_SUBMIT": "重新加载 {APP_NAME}",
  "LANGUAGE_CANCEL": "取消",
  "LANGUAGE_SYSTEM_DEFAULT": "系统默认",
  "HEALTH_DATA_NOTIFICATION": "健康报告首选项",
  "HEALTH_FIRST_POPUP_TITLE": "{APP_NAME} 健康报告",
  "HEALTH_DATA_DO_TRACK": "共享关于我如何使用 {APP_NAME} 的匿名信息",
  "HEALTH_DATA_NOTIFICATION_MESSAGE": "为了改进 {APP_NAME}, 我们会周期性地向 Adobe 发送有限的 <strong>匿名的</strong> 关于你如何使用 {APP_NAME} 的统计信息. 这些信息有助于调整特性的优先顺序, 寻找错误和定位可用性问题. <br><br>你可以通过 <strong>帮助 > 健康报告</strong> 查看你的数据或者选择不共享数据. <br><br><a href='https://github.com/adobe/brackets/wiki/Health-Data'>了解 {APP_NAME} 健康报告详情</a>",
  "HEALTH_DATA_PREVIEW": "{APP_NAME} 健康报告",
  "HEALTH_DATA_PREVIEW_INTRO": "<p>为了改进 {APP_NAME}, 我们会周期性地向 Adobe 发送有限的 <strong>匿名的</strong> 关于你如何使用 {APP_NAME} 的统计信息. 这些信息有助于调整特性的优先顺序, 寻找错误和定位可用性问题. <a href='https://github.com/adobe/brackets/wiki/Health-Data'>了解更多 {APP_NAME} 健康报告</a>, 以及它是怎样在保护你的隐私的情况下帮助 {APP_NAME} 社区. </p><p><em>如果</em>你打开它, 下面的数据将被用于下次健康报告的发送. </p>",
  "INLINE_TIMING_EDITOR_TIME": "时间",
  "INLINE_TIMING_EDITOR_PROGRESSION": "进程",
  "BEZIER_EDITOR_INFO": "<kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 移动选中点<br><kbd class='text'>Shift</kbd> 10倍移动<br><kbd class='text'>Tab</kbd> 切换点",
  "STEPS_EDITOR_INFO": "<kbd>↑</kbd><kbd>↓</kbd> 增减步进<br><kbd>←</kbd><kbd>→</kbd> 切换 'Start' 或 'End'",
  "INLINE_TIMING_EDITOR_INVALID": "原值 <code>{0}</code> 无效, 函数值已变为 <code>{1}</code>. 文档将在首次编辑时更新.",
  "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "当前的颜色",
  "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "原来的颜色",
  "COLOR_EDITOR_RGBA_BUTTON_TIP": "RGBa 格式",
  "COLOR_EDITOR_HEX_BUTTON_TIP": "十六进制格式",
  "COLOR_EDITOR_HSLA_BUTTON_TIP": "HSLa 格式",
  "COLOR_EDITOR_0X_BUTTON_TIP": "十六进制 (0x) 格式",
  "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} (使用 {1} 次)",
  "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} (使用 {1} 次)",
  "CMD_JUMPTO_DEFINITION": "跳转到源代码定义处",
  "CMD_SHOW_PARAMETER_HINT": "显示参数提示",
  "NO_ARGUMENTS": "<无相应参数>",
  "DETECTED_EXCLUSION_TITLE": "JavaScript 文件引用问题",
  "DETECTED_EXCLUSION_INFO": "Brackets 处理文件遇到问题： <br><br>{0}<br><br> 该文件不再用于处理代码提示，并会跳转到源码定义处。 为避免这个问题, 请打开项目中的 <code>.brackets.json</code> ,从 jscodehints.detectedExclusions 删除该文件",
  "CMD_REFACTOR": "重构",
  "CMD_EXTRACTTO_VARIABLE": "提取到变量",
  "CMD_EXTRACTTO_FUNCTION": "提取到函数",
  "ERROR_TERN_FAILED": "无法从 Tern 获取数据",
  "ERROR_EXTRACTTO_VARIABLE_NOT_VALID": "所选内容不构成表达式",
  "ERROR_EXTRACTTO_FUNCTION_NOT_VALID": "所选块应代表一组语句或表达式",
  "ERROR_EXTRACTTO_VARIABLE_MULTICURSORS": "提取到变量在多光标中不起作用",
  "ERROR_EXTRACTTO_FUNCTION_MULTICURSORS": "提取到函数在多光标中不起作用",
  "EXTRACTTO_FUNCTION_SELECT_SCOPE": "选择目标范围",
  "EXTRACTTO_VARIABLE_SELECT_EXPRESSION": "选择一个表达式",
  "CMD_REFACTORING_RENAME": "重命名",
  "CMD_REFACTORING_TRY_CATCH": "包装 Try Catch",
  "CMD_REFACTORING_CONDITION": "包裹状况良好",
  "CMD_REFACTORING_GETTERS_SETTERS": "创建 Getters/Setter",
  "CMD_REFACTORING_ARROW_FUNCTION": "转换为箭头函数",
  "DESCRIPTION_CODE_REFACTORING": "启用/禁用 JavaScript 代码重构",
  "ERROR_TRY_CATCH": "选择要在 Try-catch 块中封装的有效代码",
  "ERROR_WRAP_IN_CONDITION": "选择要在 Condition 区块中封装的有效代码",
  "ERROR_ARROW_FUNCTION": "将光标置于函数表达式内",
  "ERROR_GETTERS_SETTERS": "将光标置于对象表达式的成员处",
  "ERROR_RENAME_MULTICURSOR": "使用多光标时无法重命名",
  "ERROR_RENAME_QUICKEDIT": "无法重命名此标识符，因为它在此函数之外的其他地方被引用",
  "ERROR_RENAME_GENERAL": "无法重命名所选文本",
  "JSHINT_NAME": "jshint",
  "CMD_ENABLE_QUICK_VIEW": "鼠标悬停时启用快速查看",
  "CMD_ENABLE_SELECTION_VIEW": "选择视图",
  "CMD_TOGGLE_RECENT_PROJECTS": "最近的项目",
  "DOCS_MORE_LINK": "更多信息",
  "COLLAPSE_ALL": "收起所有",
  "EXPAND_ALL": "展开所有",
  "COLLAPSE_CURRENT": "收起当前",
  "EXPAND_CURRENT": "展开当前",
  "RECENT_FILES_DLG_HEADER": "最近打开的文件",
  "RECENT_FILES_DLG_CLEAR_BUTTON_LABEL": "清除",
  "RECENT_FILES_DLG_CLEAR_BUTTON_TITLE": "清除不在工作区的文件",
  "DESCRIPTION_CLOSE_BRACKETS": "值为真时，自动闭合括号",
  "DESCRIPTION_CLOSE_OTHERS_ABOVE": "值为假时，从工作区右键菜单中移除 \"关闭上面的其他文件\" 项",
  "DESCRIPTION_CLOSE_OTHERS_BELOW": "值为假时，从工作区右键菜单中移除 \"关闭下面的其他文件\" 项",
  "DESCRIPTION_CLOSE_OTHERS": "值为假时，从工作区右键菜单中移除 \"关闭其他文件\" 项",
  "DESCRIPTION_CLOSE_TAGS": "设置标签自动闭合选项",
  "DESCRIPTION_CLOSE_TAGS_DONT_CLOSE_TAGS": "不应自动闭合的一组标签",
  "DESCRIPTION_CLOSE_TAGS_WHEN_OPENING": "键入起始标签的 > 字符时闭合",
  "DESCRIPTION_CLOSE_TAGS_WHEN_CLOSING": "键入结束标签的 / 字符时闭合",
  "DESCRIPTION_CLOSE_TAGS_INDENT_TAGS": "标签内容另起一行的一组标签",
  "DESCRIPTION_CODE_FOLDING_ALWAY_USE_INDENT_FOLD": "值为真时，总是在缩进级别改变后可折叠区域标记",
  "DESCRIPTION_CODE_FOLDING_ENABLED": "值为真时，开启代码折叠",
  "DESCRIPTION_CODE_FOLDING_HIDE_UNTIL_MOUSEOVER": "值为真时，区域折叠标记只会在鼠标移动到折叠处显示",
  "DESCRIPTION_CODE_FOLDING_MAX_FOLD_LEVEL": "限制展开全部所限制的最大层级数",
  "DESCRIPTION_CODE_FOLDING_MIN_FOLD_SIZE": "显示可折叠区域图标的最小行数",
  "DESCRIPTION_CODE_FOLDING_SAVE_FOLD_STATES": "值为真时，关闭或打开文件/项目也会记住所折叠的区域",
  "DESCRIPTION_CODE_FOLDING_MAKE_SELECTIONS_FOLDABLE": "值为真时，在编辑器中开启选定文本的代码折叠功能",
  "DESCRIPTION_DISABLED_DEFAULT_EXTENSIONS": "已禁用的默认扩展",
  "DESCRIPTION_ATTR_HINTS": "开启/关闭 HTML 属性提示",
  "DESCRIPTION_CSS_PROP_HINTS": "开启/关闭 CSS/LESS/SCSS 属性名提示",
  "DESCRIPTION_JS_HINTS": "开启/关闭 JavaScript 代码提示",
  "DESCRIPTION_JS_HINTS_TYPE_DETAILS": "开启/关闭 JavaScript 代码的数据类型提示",
  "DESCRIPTION_PREF_HINTS": "开启/关闭配置文件选项提示",
  "DESCRIPTION_SPECIAL_CHAR_HINTS": "开启/关闭 HTML 实体提示",
  "DESCRIPTION_SVG_HINTS": "开启/关闭 SVG 代码提示",
  "DESCRIPTION_HTML_TAG_HINTS": "开启/关闭 HTML 标签提示",
  "DESCRIPTION_URL_CODE_HINTS": "开启/关闭 HTML & CSS/LESS/SCSS 中的 URL 提示",
  "DESCRIPTION_DRAG_DROP_TEXT": "开启/关闭拖曳功能",
  "DESCRIPTION_HEALTH_DATA_TRACKING": "开启健康数据跟踪",
  "DESCRIPTION_HIGHLIGHT_MATCHES": "开启文档中匹配字符串的自动高亮",
  "DESCRIPTION_HIGHLIGHT_MATCHES_SHOW_TOKEN": "高亮匹配光标处符号的所有字符串(无需选区)",
  "DESCRIPTION_HIGHLIGHT_MATCHES_WORDS_ONLY": "仅在选区为完整符号时高亮",
  "DESCRIPTION_INSERT_HINT_ON_TAB": "值为真时，插入在标签页上选择的代码",
  "DESCRIPTION_NO_HINTS_ON_DOT": "值为真时，不再在输入 . 符号后自动显示 JS 代码提示",
  "DESCRIPTION_JSHINT_OPTIONS": "一个具有 JSHint 默认选项的对象。有关所有可用的 JSHint 选项，请参阅以下 URL：https://jshint.com/docs/options/",
  "DESCRIPTION_LANGUAGE": "语言特定设置",
  "DESCRIPTION_LANGUAGE_FILE_EXTENSIONS": "扩展名到语言名的附加映射",
  "DESCRIPTION_LANGUAGE_FILE_NAMES": "文件名到语言名的附加映射",
  "DESCRIPTION_LINEWISE_COPY_CUT": "在没有选区时执行复制和剪切操作将复制或剪切包含光标的整行",
  "DESCRIPTION_INPUT_STYLE": "选择 CodeMirror 处理输入和焦点的方式。它可以是默认的 textarea，也可以是 contentreadible，后者更适合屏幕阅读器（不稳定）",
  "DESCRIPTION_LINTING_ENABLED": "值为真时，开启代码检查器",
  "DESCRIPTION_ASYNC_TIMEOUT": "异步检查器的超时时间",
  "DESCRIPTION_LINTING_PREFER": "首先运行的代码检查器列表",
  "DESCRIPTION_LIVE_DEV_MULTIBROWSER": "值为真时，开启实验性的实时预览",
  "DESCRIPTION_USE_PREFERED_ONLY": "值为真时，只使用 linting.prefer 指定的提供商",
  "DESCRIPTION_MAX_CODE_HINTS": "一次显示最多的提示数",
  "DESCRIPTION_PATH": "路径特定设置",
  "DESCRIPTION_PROXY": "扩展安装所用的代理服务器 URL",
  "DESCRIPTION_SCROLL_PAST_END": "值为真时，允许滚动超出文档末尾",
  "DESCRIPTION_SHOW_CODE_HINTS": "值为假时，关闭所有代码提示",
  "DESCRIPTION_SHOW_CURSOR_WHEN_SELECTING": "有文字选区时保持光标闪烁",
  "DESCRIPTION_SHOW_LINE_NUMBERS": "值为真时，在代码左侧显示行号",
  "DESCRIPTION_SMART_INDENT": "生成新区域时自动缩进",
  "DESCRIPTION_SOFT_TABS": "值为假时，关闭软 tab 功能",
  "DESCRIPTION_SORT_DIRECTORIES_FIRST": "值为真时，给项目数中的文件夹排序",
  "DESCRIPTION_SPACE_UNITS": "空格缩进所使用的空格数",
  "DESCRIPTION_STATIC_SERVER_PORT": "内置服务器开启实时预览所使用的端口号",
  "DESCRIPTION_STYLE_ACTIVE_LINE": "值为真时，高亮显示光标所在行的背景颜色",
  "DESCRIPTION_TAB_SIZE": "一个 Tab 键所代表的空格数",
  "DESCRIPTION_USE_TAB_CHAR": "值为真时，使用 tab 字符而不用空格",
  "DESCRIPTION_UPPERCASE_COLORS": "值为真时，在内联的色彩编辑器中生成大写的16进制色彩值",
  "DESCRIPTION_WORD_WRAP": "超过可视区域时换行",
  "DESCRIPTION_SEARCH_AUTOHIDE": "编辑器聚焦后立即关闭搜索",
  "DESCRIPTION_DETECTED_EXCLUSIONS": "检测会导致 Tern 失效的文件列表",
  "DESCRIPTION_INFERENCE_TIMEOUT": "Tern 尝试解析文件所需要的超时时长",
  "DESCRIPTION_SHOW_ERRORS_IN_STATUS_BAR": "值为真时，在状态栏显示错误",
  "DESCRIPTION_QUICK_VIEW_ENABLED": "值为真时，开启快速查看",
  "DESCRIPTION_SELECTION_VIEW_ENABLED": "true 表示启用选择视图",
  "DESCRIPTION_EXTENSION_LESS_IMAGE_PREVIEW": "值为真时，为缺少 URL 的扩展程序显示图像预览",
  "DESCRIPTION_THEME": "选择一个 {APP_NAME} 主题",
  "DESCRIPTION_USE_THEME_SCROLLBARS": "值为真时，允许自定义滚动条",
  "DESCRIPTION_LINTING_COLLAPSED": "值为真时，折叠提示面板",
  "DESCRIPTION_FONT_FAMILY": "改变字体",
  "DESCRIPTION_FONT_SIZE": "改变字号，例如 13px",
  "DESCRIPTION_FIND_IN_FILES_NODE": "值为真时，开启基于 node 的搜索",
  "DESCRIPTION_FIND_IN_FILES_INSTANT": "值为真时，开启实时搜索",
  "DESCRIPTION_FONT_SMOOTHING": "仅Mac: \"subpixel-antialiased\" 开启次像素防锯齿或者 \"antialiased\" 开启灰阶防锯齿",
  "DESCRIPTION_OPEN_PREFS_IN_SPLIT_VIEW": "值为假时，不再划分一个窗口打开用户配置",
  "DESCRIPTION_OPEN_USER_PREFS_IN_SECOND_PANE": "值为假时，在左边/顶部窗格中打开用户设置",
  "DESCRIPTION_MERGE_PANES_WHEN_LAST_FILE_CLOSED": "值为真时，折叠面板头部关闭后最后一个文件之后的面板",
  "DESCRIPTION_SHOW_PANE_HEADER_BUTTONS": "切换头部显示关闭或者翻转视图的按钮。",
  "DEFAULT_PREFERENCES_JSON_HEADER_COMMENT": "/*\n * This is a read-only file with the preferences supported\n * by {APP_NAME}.\n * Use this file as a reference to modify your preferences\n * file \"brackets.json\" opened in the other pane.\n * For more information on how to use preferences inside\n * {APP_NAME}, refer to the web page at https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences\n */",
  "DEFAULT_PREFERENCES_JSON_DEFAULT": "默认",
  "DESCRIPTION_PURE_CODING_SURFACE": "值为真时，开启纯代码模式，隐藏 {APP_NAME} 的其他 UI 元素",
  "DESCRIPTION_INDENT_LINE_COMMENT": "值为真时，开启行注释缩进",
  "DESCRIPTION_RECENT_FILES_NAV": "开启/关闭最近文件导航",
  "DESCRIPTION_LIVEDEV_WEBSOCKET_PORT": "运行 WebSocket 服务器进行实时预览的端口",
  "DESCRIPTION_LIVE_DEV_HIGHLIGHT_SETTINGS": "实时预览精彩片段设置",
  "DESCRIPTION_LIVEDEV_ENABLE_REVERSE_INSPECT": "false 禁用实时预览反向检查",
  "DOWNLOAD_FAILED": "下载失败。",
  "DOWNLOAD_COMPLETE": "下载完毕！",
  "UPDATE_SUCCESSFUL": "更新成功！",
  "UPDATE_FAILED": "更新失败！",
  "VALIDATION_FAILED": "验证失败！",
  "INITIALISATION_FAILED": "初始化失败！",
  "CLEANUP_FAILED": "清理失败！",
  "WARNING_TYPE": "警告！",
  "CLICK_RESTART_TO_UPDATE": "单击 “重新启动” 以更新括号。",
  "UPDATE_ON_NEXT_LAUNCH": "更新将在重新启动时生效。",
  "GO_TO_SITE": "前往 <a href = “http://brackets.io/ “> brackets.io</a> 重试。",
  "INTERNET_UNAVAILABLE": "没有可用的互联网连接。",
  "UPDATEDIR_READ_FAILED": "无法读取更新目录。",
  "UPDATEDIR_CLEAN_FAILED": "无法清理更新目录。",
  "INITIAL_DOWNLOAD": "正在下载更新...",
  "RETRY_DOWNLOAD": "下载失败。正在重试... 尝试 ",
  "VALIDATING_INSTALLER": "下载完毕！正在验证安装程序...",
  "CHECKSUM_DID_NOT_MATCH": "校验和不匹配。",
  "INSTALLER_NOT_FOUND": "找不到安装程序。",
  "DOWNLOAD_ERROR": "下载时出错。",
  "NETWORK_SLOW_OR_DISCONNECTED": "网络已断开连接或速度太慢。",
  "RESTART_BUTTON": "重启",
  "LATER_BUTTON": "稍后",
  "DESCRIPTION_AUTO_UPDATE": "启用/禁用括号自动更新",
  "AUTOUPDATE_ERROR": "错误！",
  "AUTOUPDATE_IN_PROGRESS": "更新已在进行中。",
  "NUMBER_WITH_PERCENTAGE": "{0}%",
  "CMD_FIND_RELATED_FILES": "查找相关文件",
  "PHP_VERSION_INVALID": "解析 PHP 版本时出错。请检查 “php —version” 命令的输出。",
  "PHP_UNSUPPORTED_VERSION": "安装 PHP7 运行时以启用与 PHP 相关的工具，例如代码提示、参数提示、跳转到定义等。找到版本：{0}",
  "PHP_EXECUTABLE_NOT_FOUND": "找不到 PHP 运行时。安装 PHP7 运行时并在 PHP 首选项中相应更新 “ExecutablePath”。这将启用与 PHP 相关的工具，例如代码提示、参数提示、跳转到定义等。",
  "PHP_PROCESS_SPAWN_ERROR": "启动 PHP 进程时遇到错误代码 {0}。",
  "PHP_SERVER_ERROR_TITLE": "错误",
  "PHP_SERVER_MEMORY_LIMIT_INVALID": "您提供的内存限制无效。查看 PHP 首选项以设置正确的值。",
  "DESCRIPTION_PHP_TOOLING_CONFIGURATION": "PHP 工具默认配置设置",
  "OPEN_PREFERENNCES": "打开偏好设置",
  "LANGUAGE_TOOLS_PREFERENCES": "语言工具的首选项",
  "FIND_ALL_REFERENCES": "查找所有参考资料",
  "REFERENCES_IN_FILES": "引用",
  "REFERENCE_IN_FILES": "参考",
  "REFERENCES_NO_RESULTS": "当前光标位置没有可用的引用",
  "CMD_FIND_DOCUMENT_SYMBOLS": "查找文档符号",
  "CMD_FIND_PROJECT_SYMBOLS": "查找项目符号",
  "REMOTE_DEBUGGING_ENABLED": "在本地主机上启用了远程调试：",
  "REMOTE_DEBUGGING_PORT_INVALID": "无法在端口 {0} 上启用远程调试。端口号应介于 {1} 和 {2} 之间。",
  "DESCRIPTION_EXTERNAL_APPLICATION_ASSOCIATE": "文件扩展名到外部应用程序的映射。语法:\"<file_type>“: “<default|ApplicationName|ApplicationPath>”，使用 “默认” 在系统默认应用程序中打开该文件类型的文件。",
  "ASSOCIATE_GRAPHICS_FILE_TO_DEFAULT_APP_TITLE": "在外部编辑器中打开图形文件。",
  "ASSOCIATE_GRAPHICS_FILE_TO_DEFAULT_APP_MSG": "您当前的文件夹具有 {APP_NAME} 不支持的图形文件类型。<br/>现在，您可以将特定文件类型与外部编辑器相关联。关联后，您可以通过双击 “文件树” 中的文件，在默认应用程序中打开 .xd、.psd、.jpg、.png、.ai、.svg 等图形文件。<br/><br/>请单击 “确定” 按钮，将图形文件类型与其各自的默认应用程序相关联。",
  "ASSOCIATE_GRAPHICS_FILE_TO_DEFAULT_APP_CNF_MSG": "以下文件类型已成功与默认应用程序关联。<br/>{0} 您可以通过前往 “调试->打开首选项文件” 菜单来选择是否在brackets.json中删除/添加新文件类型关联的偏好。",
  "UNSUPPORTED_BROWSER": "不支持浏览器",
  "UNSUPPORTED_BROWSER_OPEN_FOLDER": "浏览器不支持打开文件夹",
  "UNSUPPORTED_BROWSER_MESSAGE_LINE1": "请使用以下受支持的浏览器之一。",
  "UNSUPPORTED_BROWSER_MESSAGE_LINE2": " 我们正在努力使Phoenix在更多浏览器中可用。您可以关闭此对话框，但是 Phoenix 中的某些功能无法在此浏览器中使用。",
  "CANNOT_PUBLISH_LARGE_PROJECT": "无法发布大型项目",
  "CANNOT_PUBLISH_LARGE_PROJECT_MESSAGE": "Phoenix 仍处于实验阶段。我们尚未启用文件大于 500 的项目的同步。",
  "SHARE_WEBSITE": "发布和共享网站？",
  "PUBLISH": "发布",
  "PUBLISH_CONSENT_MESSAGE": "快速预览更改并与他人共享您的网站。菲尼克斯可以在 {0} 为你发布这个网站。发布的链接将在 7 天内有效。</br>你想发布和分享你的网站吗？",
  "PUBLISH_SYNC_IN_PROGRESS": "正在同步以供预览...",
  "PUBLISH_PAGE": "点击发布和分享此站点",
  "PUBLISH_VIEW_PAGE": "点击查看已发布的页面",
  "MISSING_FIELDS": "缺少字段",
  "PLEASE_FILL_ALL_REQUIRED": "请填写所有以红色突出显示的必填字段",
  "CODE_EDITOR": "代码编辑器",
  "BUILD_THE_WEB": "搭建网络",
  "IMPORT_PROJECT": "导入项目",
  "GITHUB_PROJECT": "Github",
  "NEW_PROJECT_FROM_GITHUB": "来自 Github 的新项目",
  "GITHUB_REPO_URL": "Github 仓库网址：",
  "CREATE_PROJECT": "创建项目",
  "SETTING_UP_PROJECT": "设置项目",
  "LOCATION": "地点：",
  "DOWNLOADING": "正在下载...",
  "EXTRACTING_FILES_PROGRESS": "正在提取 {1} 个文件中的 {0} 个。",
  "DOWNLOAD_FAILED_MESSAGE": "确保下载 URL 是有效的。</br>注意：由于 Phoenix 处于 alpha 版本，因此不允许使用大于 25 MB 的私有存储库和 Github URL。",
  "PLEASE_SELECT_A_FOLDER": "请选择一个文件夹...",
  "UNZIP_IN_PROGRESS": "正在解压缩文件...",
  "UNZIP_FAILED": "错误：解压缩失败。",
  "CONFIRM_REPLACE_TITLE": "确认更换",
  "KEEP_BOTH": "两者都保留",
  "EXPLORE": "HTML 游戏",
  "BLOG": "博客",
  "PHOENIX_DEFAULT_PROJECT": "默认项目",
  "PROJECT_NAME": "项目名称：",
  "NEW_HTML": "新 HTML 项目",
  "LICENSE": "许可证：",
  "CREDITS": "积分：",
  "PREVIEW": "预览",
  "BUILD_WEBSITE": "建立网站",
  "VIEW_MORE": "查看更多...",
  "NEW_PROJECT_NOTIFICATION": "单击此图标可<br/>创建新项目。</br><a href='#' style='float:right;'>好的</a>",
  "DEFAULT_PROJECT_NOTIFICATION": "点击此处在 phoenix 中打开<br/><b>默认项目</b>。</br><a href='#' style='float:right;'>好的</a>",
  "DIRECTORY_REPLACE_MESSAGE": "选定的文件夹 <span class='dialog-filename'>{0}</span> 不为空。确实要用项目替换文件夹内容吗？",
  "BUILD_WEBSITE_SECTION": "建立网站",
  "LEARN_SECTION": "用例子学习",
  "WEBPAGE_HOME_PAGE": "主页布局",
  "WEBPAGE_BLOG": "博客页面",
  "WEBPAGE_DASHBOARD": "HTML 控制板",
  "WEBPAGE_BOOTSTRAP_EXAMPLES": "引导程序示例",
  "GUIDED_FILES_SIDEBAR": "选择一个 HTML 文件</br><a href='#' style='float:right;'>好的</a>",
  "GUIDED_LIVE_PREVIEW": "进行一些代码更改并保存文件以查看预览。</br><a href='#' style='float:right;'>好的</a>",
  "GUIDED_LIVE_PREVIEW_POPOUT": "单击此按钮可将实时预览弹出到新选项卡。</br><a href='#' style='float:right;'>好的</a>",
  "TEST_TRANSLATE": "用它来测试翻译",
  "BEAUTIFY_ERROR": "无法美化代码。检查语法。",
  "BEAUTIFY_ERROR_ORIGINAL_CHANGED": "无法美化。美化后编辑器文本已更改。",
  "BEAUTIFY_PROJECT_BUSY_MESSAGE": "美化文件 {0}",
  "BEAUTIFY_ERROR_SELECTION": "无法美化。</br>选定的代码块不完整或语法无效。",
  "BEAUTIFY_OPTIONS": "控制美化代码工作方式的选项",
  "BEAUTIFY_OPTION_PRINT_WIDTH": "指定美化器将环绕的线长",
  "BEAUTIFY_OPTION_SEMICOLON": "在每条语句的末尾添加一个分号",
  "BEAUTIFY_OPTION_SINGLE_QUOTE": "使用单引号代替双引号",
  "BEAUTIFY_OPTION_QUOTE_PROPS": "当对象中的属性被引用时更改",
  "BEAUTIFY_OPTION_BRACKET_SAME_LINE": "将多行 HTML（HTML、JSX、Vue、Angular）元素的 > 放在最后一行的末尾，而不是单独放在下一行（不适用于自闭元素）",
  "BEAUTIFY_OPTION_SINGLE_ATTRIBUTE_PER_LINE": "在 HTML、Vue 和 JSX 中强制执行每行单个属性",
  "BEAUTIFY_OPTION_PROSE_WRAP": "如果散文超过了 markdown 文件中的打印宽度，则封装散文",
  "BEAUTIFY_OPTION_PRINT_TRAILING_COMMAS": "尽可能在多行逗号分隔的语法结构中打印尾随逗号"
});