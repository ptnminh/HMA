import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EVENTS } from './shared';
import { SendgridService } from './app.service';
import { MAIL_TEMPLATE_ID } from './shared/libs/common/constant/mail-template-id';

@Controller()
export class AppController {
  constructor(private readonly mailService: SendgridService) {}

  @EventPattern(EVENTS.AUTH_REGISTER)
  async handleSendEmailRegister(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      const dynamic_template_data = {
        link: data.link,
      };
      // const msg = this.mailService.messageSignUpGenerate(
      //   [data.email as string],
      //   MAIL_TEMPLATE_ID.REGISTER as string,
      //   dynamic_template_data,
      // );

      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);
      await this.mailService.send({
        from: process.env.FROM_EMAIL as string,
        templateId: MAIL_TEMPLATE_ID.REGISTER as string,
        dynamicTemplateData: dynamic_template_data,
        to: data.email as string,
      });
      return true;
    } catch (error) {
      console.log(
        require('util').inspect(error, {
          showHidden: false,
          depth: null,
          colors: true,
        }),
      );
    }
  }
}
