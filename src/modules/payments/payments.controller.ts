import { Controller, Post, Body, Res, HttpCode } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Response } from "express";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("gumroad-webhook")
  @HttpCode(200)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    try {
      await this.paymentsService.handleGumroadWebhook(body);
      return res.json({ ok: true });
    } catch (err) {
      return res.status(400).json({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        error: err.message || "Webhook processing failed",
      });
    }
  }
}
