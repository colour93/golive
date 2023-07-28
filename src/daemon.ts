import { spawn } from "child_process";
import path = require("path");

const livegoOptions = require(process.env.CONFIG_PATH).livego;

export async function runBinaryFile() {
  let binaryName = "livego";

  switch (process.platform) {
    case "win32":
      binaryName += ".exe";
      break;

    default:
      break;
  }

  const binaryProcess = spawn(path.resolve("config", binaryName), [
    `--api_addr=localhost:${livegoOptions.api_port}`,
    `--hls_addr=:${livegoOptions.hls_port}`,
    `--httpflv_addr=:${livegoOptions.flv_port}`,
    `--rtmp_addr=:${livegoOptions.rtmp_port}`,
    `--level=${process.env.ENV.includes("dev") ? "debug" : "info"}`,
  ]);

  binaryProcess.stdout.on("data", (data) => {
    console.log(`Binary Output: ${data}`);
  });

  binaryProcess.stderr.on("data", (data) => {
    console.error(`Binary Error: ${data}`);
  });

  const exitCode = await new Promise((resolve) => {
    binaryProcess.on("exit", (code) => {
      console.log(`Binary Process exited with code ${code}`);
      resolve(code);
    });
  });

  // 进程崩溃时重新运行
  if (exitCode !== 0) {
    console.log("Restarting Binary Process...");
    await runBinaryFile();
  }
}
