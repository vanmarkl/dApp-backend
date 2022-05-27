import axios from "axios";
import { setupCache } from "axios-cache-adapter";

import axiosThrottle from "axios-request-throttle";

const cache = setupCache({
  maxAge: 60 * 1000,
});

const api = axios.create({
  adapter: cache.adapter,
});

axiosThrottle.use(api, { requestsPerSecond: 10 });
export default api;
