import { ChatERNIEBot, createAssistant } from '../src';
import { run } from './_wechaty';

const llm = new ChatERNIEBot({
  token: process.env.EB_ACCESS_TOKEN,
});

const assistant = createAssistant({
  llm,
});

// 注册自定义指令
assistant.command.register('ping', ctx => {
  ctx.reply('pong');
});

run(assistant);
