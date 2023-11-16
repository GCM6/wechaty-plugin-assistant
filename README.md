# @zhengxs/wechaty-plugin-assistant

基于 wechaty 的聊天助手插件。

> 非稳定状态，请勿用于生产环境

## 快速开始

### 安装

```sh
# With NPM
$ npm i wechaty @zhengxs/wechaty-plugin-assistant -S

# With Yarn
$ yarn add wechaty @zhengxs/wechaty-plugin-assistant

# With PNPM
$ pnpm add wechaty wechaty-plugin-contrib @zhengxs/wechaty-plugin-assistant
```

### 使用

```ts
import { ChatYiYan, defineLLM } from '@zhengxs/wechaty-plugin-assistant';
import { WechatyBuilder } from 'wechaty';
import { QRCodeTerminal } from 'wechaty-plugin-contrib';

// ============ 创建 AI 助手  ============

const llm = new ChatYiYan({
  cookies: process.env.ERNIE_BOT_COOKIE,
});

const assistant = createAssistant({
  llm,
});

// ============ 启动 wechaty 服务  ============

const bot = WechatyBuilder.build({
  name: 'demo',
  puppet: 'wechaty-puppet-wechat4u',
  puppetOptions: { uos: true },
});

bot.use(QRCodeTerminal({ small: true }));

// 作为插件使用
bot.use(assistant.callback());

bot.start();
```

## 教程

### 自定义模型

```ts
import {
  ChatModel,
  ConversationContext,
  defineLLM,
} from '@zhengxs/wechaty-plugin-assistant';

// ============ 基于类  ============

class ChatCustom implements ChatModel {
  name = 'custom';
  human_name = '自定义模型';

  call(ctx: ConversationContext) {
    // message 就是 wechaty 的消息模型
    const { message } = ctx;

    // 直接回复发送者，如果在群里会直接 @ 他
    ctx.reply(`hello ${message.text()}`);
  }
}

// ============ 基于普通对象  ============

const llm = defineLLM({
  name: 'custom',
  human_name: '自定义模型',
  call(ctx: ConversationContext) {
    // message 就是 wechaty 的消息模型
    const { message } = ctx;

    // 直接回复发送者，如果在群里会直接 @ 他
    ctx.reply(`hello ${message.text()}`);
  },
});
```

记住当前聊天上下文

```ts
class ChatCustom implements ChatModel {
  name = 'custom';
  human_name = '自定义模型';

  call(ctx: ConversationContext) {
    // message 就是 wechaty 的消息模型
    const { message, session } = ctx;

    // 参考了 koa-session 模块
    // 可以在这里写入任何支持序列化的数据
    // 会自动保存到缓存中，无需手动处理
    session.view = 1;

    // 直接回复发送者，如果在群里会直接 @ 他
    ctx.reply(`hello ${message.text()}`);
  }
}
```

### 注册聊天指令

```ts
const assistant = createAssistant({
  llm,
});

// 注意：这里不要带 / 线，聊天需要加 斜线
assistant.command.register('ping', function (ctx: ConversationContext) {
  ctx.reply('pong');
});
```

在聊天窗口输入 `/ping`，机器人就会回复 `pong`.

### 使用多模型切换功能

使用 `MultiChatModelSwitch` 类，可以让用户切换不同的模型。

```ts
import {
  createAssistant,
  MultiChatModelSwitch,
} from '@zhengxs/wechaty-plugin-assistant';

const assistant = createAssistant({
  llm: new MultiChatModelSwitch([llm1, llm2, ..., llmN]),
});
```

**使用**

- 输入: `查看模型`
  输出: 当前用户模型和列表
- 输入: `切换xxx`
  输出：已切换至 xx

### 存储助手状态

```ts
import {
  createAssistant,
  type MemoryCache,
} from '@zhengxs/wechaty-plugin-assistant';

// 聊天上下文 和 MultiChatModelSwitch 的用户配置 都会调用这个
// 默认存储在内存中
const cache: MemoryCache = {
 /**
   * 读取一条缓存
   *
   * @param key - 缓存的键
   * @returns 缓存的值
   */
  async get(key: string) {

  },

  /**
   * 写入一条缓存
   *
   * @param key - 缓存的键
   * @param value - 缓存的值
   * @param ttl - 单位为秒
   * @returns 是否写入成功
   */
  async set(key: string, value: unknown, ttl?: number): Promise<true> {
    return true
  },

  /**
   * 删除一条缓存
   * @param key - 缓存的键
   * @returns 是否删除成功
   */
  async delete(key: string): Promise<boolean> {
    return true
  },

  /**
   * 删除所有条目
   */
  async clear(): Promise<void> {
    // pass
  }
}

const assistant = createAssistant({
  llm,
  cache:
});
```

- `user:config:<talkerId>` - 这是用户配置的 key
- `assistant:session:${md5(roomId + talkerId)}` - 这是聊天上下文的 key

## 感谢

- [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api)
- [commander](https://github.com/tj/commander.js)
- [wechaty](https://github.com/wechaty/wechaty)
- [koa.js](https://github.com/koajs/koa)
- [koa-session](https://github.com/koajs/session)
- [vitepress](https://github.com/vuejs/vitepress)
- And more

以上排名不分先后

## License

MIT
