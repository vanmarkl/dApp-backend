import { FirebaseAuthProvider } from "react-admin-firebase";
import config from "./config";
import options from "./options";

const authProvider = FirebaseAuthProvider(config, options);

export { authProvider };
