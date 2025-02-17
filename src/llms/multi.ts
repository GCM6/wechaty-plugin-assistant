import { codeBlock } from 'common-tags';

import {
  Assistant,
  type ChatModel,
  ChatType,
  type ConversationContext,
} from '../core';

export class MultiChatModelSwitch implements ChatModel {
  name: string = 'multi-model';
  human_name: string = '多模型管理';
  input_type: ChatType[] = [];

  // TODO 改成数组以支持不同模型的多个实例
  protected llms: Map<string, ChatModel> = new Map();
  protected llm?: ChatModel;

  constructor(llms: ChatModel[]) {
    this.llm = llms[0];
    this.llms = new Map(llms.map(llm => [llm.name, llm]));
    this.input_type = llms.map(llm => llm.input_type).flat();
  }

  async call(ctx: ConversationContext, assistant: Assistant) {
    // TODO 类型转为字符串，移动到 core 中
    if (ctx.type === ChatType.Text) {
      return this.processText(ctx, assistant);
    }

    return this.calling(ctx, assistant);
  }

  protected async calling(ctx: ConversationContext, assistant: Assistant) {
    const llm = this.resolve(ctx.userConfig.model);
    if (!llm) return;

    if (llm.input_type.includes(ctx.type)) {
      return llm.call(ctx, assistant);
    }

    ctx.reply(codeBlock`
      ⊶ 系统提示
      ﹊
      ${llm.human_name} 暂不支持处理此类消息！`);
  }

  protected processText(ctx: ConversationContext, assistant: Assistant) {
    const { message, userConfig } = ctx;
    const text = message.text();

    if (text === '查看模型') {
      const llm = this.resolve(userConfig.model);

      return ctx.reply(codeBlock`
      ⊶ 系统提示
      ﹊
      当前模型: ${llm?.human_name || '暂无可用模型'}。

      模型列表
      ${Array.from(this.llms.values())
        .map(llm => `  - ${llm.human_name}`)
        .join(`\n`)}`);
    }

    if (text.startsWith('切换')) {
      const searchName = text.split('切换')[1]?.trim();
      if (!searchName) {
        return ctx.reply(codeBlock`
          ⊶ 系统提示
          ﹊
          模型列表
          ${Array.from(this.llms.values())
            .map(llm => `  - ${llm.human_name}`)
            .join(`\n`)}`);
      }

      const found = this.find(searchName.toString());

      if (found) {
        userConfig.model = found.name;

        return ctx.reply(codeBlock`
        ⊶ 系统提示
        ﹊
        已切换至 ${found.human_name}`);
      }

      return ctx.reply(codeBlock`
      ⊶ 系统提示
      ﹊
      需要切换至的模型不存在或不可用，请选择其他模型。

      模型列表
      ${Array.from(this.llms.values())
        .map(llm => `  - ${llm.human_name}`)
        .join(`\n`)}`);
    }

    return this.calling(ctx, assistant);
  }

  protected resolve(name?: string): ChatModel | undefined {
    if (!name) return this.llm;
    return this.llms.get(name) || this.llm;
  }

  protected find(searchName: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, llm] of this.llms) {
      if (
        llm.name.toLowerCase().includes(searchName) ||
        llm.human_name.toLowerCase().includes(searchName)
      ) {
        return llm;
      }
    }
  }
}
