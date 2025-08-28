// src/payments/payments.controller.ts
import { Controller, Post, Body, HttpCode, Headers } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

type GumroadWebhookBody = {
  // минимально нужное
  url_params?: { uuid?: string } | null;
  email?: string | null;
  price?: string | number | null;
  currency?: string | null;
  order_id?: string | null;
  product_id?: string | null;
  // ...другие поля gumroad по желанию
};

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(
    @Body() body: GumroadWebhookBody,
    @Headers() headers: Record<string, string>,
  ) {
    await this.paymentsService.handleGumroadWebhook(body, headers);
    return { ok: true };
  }
}
