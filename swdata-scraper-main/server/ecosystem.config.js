const defaultConfig = {
  cwd: "./build/scripts/",
  node_args: "-r dotenv/config",
  restart_delay: "5000",
  max_restarts: "10",
  max_memory_restart: "1G",
  autorestart: false,
};

module.exports = {
  apps: [
    {
      ...defaultConfig,
      name: "current_price_data",
      script: "./current_data.js",
      cron_restart: "* * * * *",
      args: "--dataType currentPrice",
    },
    {
      ...defaultConfig,
      name: "current_market_data",
      script: "./current_data.js",
      cron_restart: "* * * * *",
      args: "--dataType marketData",
    },
    {
      ...defaultConfig,
      name: "historical_daily_data",
      script: "./historical_data.js",
      cron_restart: "0 */12 * * *",
      args: "--dataType dailies",
    },
    {
      ...defaultConfig,
      name: "historical_hourly_data",
      script: "./historical_data.js",
      cron_restart: "15 */6 * * *",
      args: "--dataType hourlies",
    },
    {
      ...defaultConfig,
      name: "historical_minute_data",
      script: "./historical_data.js",
      cron_restart: "30 */3 * * *",
      args: "--dataType minutes",
    },
    {
      ...defaultConfig,
      name: "calculated_hourly_data",
      script: "./calculated_data.js",
      cron_restart: "5 */1 * * *",
      args: "--dataType hourlies",
    },
    {
      ...defaultConfig,
      name: "calculated_daily_data",
      script: "./calculated_data.js",
      cron_restart: "5 */4 * * *",
      args: "--dataType dailies",
    },
    {
      ...defaultConfig,
      name: "tokenset_allocation_data",
      script: "./tokenset_data.js",
      cron_restart: "*/15 * * * *",
      args: "--dataType allocationData",
    },
  ],
};
