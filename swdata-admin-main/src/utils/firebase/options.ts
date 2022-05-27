import { RAFirebaseOptions } from "react-admin-firebase";

// All options are optional
const options: RAFirebaseOptions = {
  // Enable logging of react-admin-firebase
  logging: true,
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: "session",

  // Use firebase sdk queries for pagination, filtering and sorting
  lazyLoading: {
    enabled: false,
  },
};

export default options;
