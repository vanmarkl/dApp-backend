alter table "prices"."tokens" add column "calledCoinGecko" boolean
 not null default 'false';
