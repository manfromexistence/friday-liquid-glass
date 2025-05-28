import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["https://3000-manfmexistence-friday-yjy3rn7lro3.ws-us119.gitpod.io/"],
	webpack: (config) => {
		config.externals.push("@libsql/client");
		return config;
	},
};

export default nextConfig;
