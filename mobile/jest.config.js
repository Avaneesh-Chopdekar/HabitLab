// jest.config.js — place in project root
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-community/slider)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "store/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};
