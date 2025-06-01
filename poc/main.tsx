import * as React from "react";
import { renderToReadableStream } from "react-dom/server";
import { parseArgs } from "jsr:@std/cli/parse-args";

async function Hello({ name }: { name: string }) {
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  return <h1>Hello {name}!</h1>;
}

function App({ name }: { name: string }) {
  return (
    <div>
      <React.Suspense fallback={"Loading..."}>
        <Hello name={name} />
      </React.Suspense>
    </div>
  );
}

const { props, wait } = parseArgs(Deno.args, {
  string: ['props'],
  boolean: ['wait']
});

let parsedProps = {};
if (typeof props !== 'undefined') {
  const data = JSON.parse(props);
  if (typeof data === "object") {
    parsedProps = data;
  }
}
// @ts-expect-error The props are not known at this point, maybe use zod?
const stream = await renderToReadableStream(<App {...parsedProps} />, {
  identifierPrefix: 'test-prefix-',
});

if (wait) {
  await stream.allReady;
}

await stream.pipeTo(Deno.stdout.writable);

Deno.exit(0);
