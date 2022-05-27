alter table "prices"."tokens" add constraint "tokens_address_chainId_key" unique ("address", "chainId");
