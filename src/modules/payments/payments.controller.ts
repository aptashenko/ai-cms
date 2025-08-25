// payments.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Get,
  Param,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook")
  @HttpCode(200) // важно для BMC
  async handleWebhook(@Body() body: any, @Res() res) {
    console.log("Webhook payload:", body);

    try {
      await this.paymentsService.savePayment(body);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      return res.json({ ok: true });
    } catch (e) {
      console.error("Error saving payment:", e);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return res.status(500).json({ ok: false });
    }
  }
}
