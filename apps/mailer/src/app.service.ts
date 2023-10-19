import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
@Injectable()
export class SendgridService {
  constructor() {
    const sendgridApiKey = process.env.SENDGRID_API_KEY as string;
    SendGrid.setApiKey(sendgridApiKey);
  }

  messageSignUpGenerate(
    to: string[],
    templateId: string,
    dynamic_template_data,
  ) {
    return {
      to: to,
      templateId: templateId,
      from: {
        name: process.env.FROM_EMAIL_NAME as string,
        email: process.env.FROM_EMAIL as string,
      },
      dynamicTemplateData: dynamic_template_data,
    };
  }
  messageForgotPasswordGenerate(
    to: string[],
    templateId: string,
    dynamic_template_data,
  ) {
    return {
      to: to,
      templateId: templateId,
      from: {
        name: process.env.FROM_EMAIL_NAME as string,
        email: process.env.FROM_EMAIL as string,
      },
      dynamic_template_data,
    };
  }
  async send(msg: SendGrid.MailDataRequired) {
    return SendGrid.send(msg);
  }

  messageCronjobGenerate(to: string[], templateId: string) {
    return {
      to: to,
      templateId: templateId,
      from: { email: process.env.FROM_EMAIL as string },
    };
  }
}
