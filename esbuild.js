const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
};

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const webviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/Webview/main-add-sbc.ts"],
  outfile: "./out/webview/main-add-sbc.js",
  plugins: [
    // Copy webview css files to `out` directory unaltered
    //css
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./src/Webview/*.css"],
        to: ["./out/webview"],
      }
    }),
    //webview/*.*
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./assets/webview/*.*"],
        to: ["./out/webview"],
      }
    }),
    //codicon
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./node_modules/@vscode/codicons/dist/codicon.css"],
        to: ["./out/webview"],
      }
    }),
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./node_modules/@vscode/codicons/dist/codicon.ttf"],
        to: ["./out/webview"],
      }
    })
  ],
};

// This watch config adheres to the conventions of the esbuild-problem-matchers
// extension (https://github.com/connor4312/esbuild-problem-matchers#esbuild-via-js)
/** @type BuildOptions */
const watchConfig = {
  watch: {
    onRebuild(error, result) {
      console.log("[watch] build started");
      if (error) {
        error.errors.forEach((error) =>
          console.error(
            `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
          )
        );
      } else {
        console.log("[watch] build finished");
      }
    },
  },
};

// Build script
(async () => {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--watch")) {
      // Build and watch extension and webview code
      console.log("[watch] build started");
      await build({
        ...watchConfig,
      });
      await build({
        ...webviewConfig,
        ...watchConfig,
      });
      console.log("[watch] build finished");
    } else {
      // Build extension and webview code
      await build(webviewConfig);
      console.log("build complete");
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();
