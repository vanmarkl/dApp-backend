SET check_function_bodies = false;
CREATE SCHEMA prices;
CREATE TABLE prices.daily (
    id integer NOT NULL,
    price text NOT NULL,
    "tokenId" integer NOT NULL,
    epoch integer NOT NULL
);
COMMENT ON TABLE prices.daily IS 'daily price';
CREATE SEQUENCE prices.daily_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.daily_id_seq OWNED BY prices.daily.id;
CREATE TABLE prices.hourly (
    id integer NOT NULL,
    price text NOT NULL,
    "tokenId" integer NOT NULL,
    epoch integer NOT NULL
);
COMMENT ON TABLE prices.hourly IS 'hourly price data';
CREATE SEQUENCE prices.hourly_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.hourly_id_seq OWNED BY prices.hourly.id;
CREATE TABLE prices.minutes (
    id integer NOT NULL,
    price text NOT NULL,
    epoch integer NOT NULL,
    "tokenId" integer NOT NULL
);
COMMENT ON TABLE prices.minutes IS 'price per minute data';
CREATE SEQUENCE prices.minutes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.minutes_id_seq OWNED BY prices.minutes.id;
CREATE TABLE prices.networks (
    id integer NOT NULL,
    name text NOT NULL,
    "chainId" text NOT NULL
);
COMMENT ON TABLE prices.networks IS 'supported networks for tokens';
CREATE SEQUENCE prices.networks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.networks_id_seq OWNED BY prices.networks.id;
CREATE TABLE prices.token_infos (
    id integer NOT NULL,
    "marketCap" text,
    "changePercentDay" text,
    "volumeDay" text,
    "totalSupply" text,
    "tokenId" integer NOT NULL,
    "currentPrice" text
);
COMMENT ON TABLE prices.token_infos IS 'market data for token';
CREATE SEQUENCE prices.token_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.token_info_id_seq OWNED BY prices.token_infos.id;
CREATE TABLE prices.tokens (
    id integer NOT NULL,
    address text NOT NULL,
    symbol text NOT NULL,
    "creationEpoch" integer DEFAULT 0,
    tokenset boolean DEFAULT false NOT NULL,
    "tokensetComponent" boolean DEFAULT false NOT NULL,
    tradable boolean DEFAULT true NOT NULL,
    decimals integer DEFAULT 18,
    "chainId" integer
);
COMMENT ON TABLE prices.tokens IS 'token symbol and address';
CREATE SEQUENCE prices.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.tokens_id_seq OWNED BY prices.tokens.id;
CREATE TABLE prices.tokenset_allocations (
    id integer NOT NULL,
    "setTokenId" integer NOT NULL,
    "tokenId" integer NOT NULL,
    icon text,
    "fullAmountInSet" text NOT NULL,
    "percentOfSet" text NOT NULL,
    quantity text NOT NULL,
    "priceChange24Hr" text,
    "currentPrice" text
);
COMMENT ON TABLE prices.tokenset_allocations IS 'tokenset allocation data for tokenset tokens';
CREATE SEQUENCE prices.tokenset_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE prices.tokenset_allocations_id_seq OWNED BY prices.tokenset_allocations.id;
ALTER TABLE ONLY prices.daily ALTER COLUMN id SET DEFAULT nextval('prices.daily_id_seq'::regclass);
ALTER TABLE ONLY prices.hourly ALTER COLUMN id SET DEFAULT nextval('prices.hourly_id_seq'::regclass);
ALTER TABLE ONLY prices.minutes ALTER COLUMN id SET DEFAULT nextval('prices.minutes_id_seq'::regclass);
ALTER TABLE ONLY prices.networks ALTER COLUMN id SET DEFAULT nextval('prices.networks_id_seq'::regclass);
ALTER TABLE ONLY prices.token_infos ALTER COLUMN id SET DEFAULT nextval('prices.token_info_id_seq'::regclass);
ALTER TABLE ONLY prices.tokens ALTER COLUMN id SET DEFAULT nextval('prices.tokens_id_seq'::regclass);
ALTER TABLE ONLY prices.tokenset_allocations ALTER COLUMN id SET DEFAULT nextval('prices.tokenset_allocations_id_seq'::regclass);
ALTER TABLE ONLY prices.daily
    ADD CONSTRAINT daily_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.daily
    ADD CONSTRAINT "daily_tokenId_price_epoch_key" UNIQUE ("tokenId", price, epoch);
ALTER TABLE ONLY prices.hourly
    ADD CONSTRAINT hourly_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.hourly
    ADD CONSTRAINT "hourly_tokenId_price_epoch_key" UNIQUE ("tokenId", price, epoch);
ALTER TABLE ONLY prices.minutes
    ADD CONSTRAINT minutes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.minutes
    ADD CONSTRAINT "minutes_tokenId_price_epoch_key" UNIQUE ("tokenId", price, epoch);
ALTER TABLE ONLY prices.networks
    ADD CONSTRAINT "networks_chainId_key" UNIQUE ("chainId");
ALTER TABLE ONLY prices.networks
    ADD CONSTRAINT networks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.token_infos
    ADD CONSTRAINT token_info_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.token_infos
    ADD CONSTRAINT "token_info_tokenId_key" UNIQUE ("tokenId");
ALTER TABLE ONLY prices.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.tokenset_allocations
    ADD CONSTRAINT tokenset_allocations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY prices.tokenset_allocations
    ADD CONSTRAINT "tokenset_allocations_setTokenId_tokenId_key" UNIQUE ("setTokenId", "tokenId");
ALTER TABLE ONLY prices.daily
    ADD CONSTRAINT "daily_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.hourly
    ADD CONSTRAINT "hourly_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.minutes
    ADD CONSTRAINT "minutes_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.token_infos
    ADD CONSTRAINT "token_info_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.tokens
    ADD CONSTRAINT "tokens_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES prices.networks(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.tokenset_allocations
    ADD CONSTRAINT "tokenset_allocations_setTokenId_fkey" FOREIGN KEY ("setTokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY prices.tokenset_allocations
    ADD CONSTRAINT "tokenset_allocations_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES prices.tokens(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
