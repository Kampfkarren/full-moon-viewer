import React, { useState } from "react";
import { AstDisplay } from "./AstDisplay";
import { CodeInput } from "./CodeInput";
import { Node } from "../node";

const DEFAULT_CODE = "print('Hello, world!')";

export const Demo = () => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [compactTokens, setUseCompactTokens] = useState(false);
  const [useMonaco, setUseMonaco] = useState(true);

  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);
  const [currentHover, setCurrentHover] = useState<Node | undefined>(undefined);

  return (
    <div className="demo">
      <div className="settings">
        <input
          id="auto-parse"
          type="checkbox"
          checked={autoUpdate}
          onChange={() => setAutoUpdate(!autoUpdate)}
        />

        <label htmlFor="auto-parse">Auto update</label>

        <input
          id="use-monaco"
          type="checkbox"
          checked={useMonaco}
          onChange={() => setUseMonaco(!useMonaco)}
        />

        <label htmlFor="use-monaco">
          Use Monaco for editor (turn off if on mobile)
        </label>

        <input
          id="compact-tokens"
          type="checkbox"
          checked={compactTokens}
          onChange={() => setUseCompactTokens(!compactTokens)}
        />

        <label htmlFor="compact-tokens">Compact tokens</label>
      </div>

      <hr />

      <div className="screens">
        <CodeInput
          currentCode={currentCode}
          currentHover={currentHover}
          onChange={setCurrentCode}
          useMonaco={useMonaco}
        />

        <AstDisplay
          autoUpdate={autoUpdate}
          code={currentCode}
          compactTokens={compactTokens}
          currentHover={currentHover}
          setCurrentHover={setCurrentHover}
        />
      </div>
    </div>
  );
};
