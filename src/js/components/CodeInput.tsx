import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Node, Position } from "../node";

const MARKER_HOVER = "hover";

type CodeInputProps = {
  currentCode: string;
  currentHover?: Node;
  onChange: (code: string) => void;
  useMonaco: boolean;
};

const range = (node: Node): { start: Position; end: Position } | undefined => {
  if (node.start_position && node.end_position) {
    return {
      start: node.start_position,
      end: node.end_position,
    };
  }

  let start, end;

  for (const child of Object.values(node)) {
    if (typeof child !== "object") {
      continue;
    }

    const childRange = range(child as Node);

    if (childRange === undefined) {
      continue;
    }

    if (start === undefined || childRange.start.bytes < start.bytes) {
      start = childRange.start;
    }

    if (end === undefined || childRange.end.bytes > end.bytes) {
      end = childRange.end;
    }
  }

  if (start === undefined || end === undefined) {
    return undefined;
  } else {
    return { start, end };
  }
};

const MonacoEditor = ({
  currentCode,
  currentHover,
  onChange,
}: CodeInputProps) => {
  const monaco = useMonaco();

  // console.log(monaco);
  useEffect(() => {
    if (!monaco) {
      return;
    }

    // TODO: Highlight errors
    const model = monaco.editor.getModels()[0];
    const nodeRange = currentHover && range(currentHover);
    console.log(currentHover, nodeRange);

    if (nodeRange) {
      monaco.editor.setModelMarkers(model, MARKER_HOVER, [
        {
          startLineNumber: nodeRange.start.line,
          startColumn: nodeRange.start.character,
          endLineNumber: nodeRange.end.line,
          endColumn: nodeRange.end.character,
          message: "Hovered node",
          severity: monaco.MarkerSeverity.Info,
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, MARKER_HOVER, []);
    }
  }, [monaco, currentHover]);

  return (
    <Editor
      height="90vh"
      defaultLanguage="lua"
      defaultValue={currentCode}
      onChange={(value) => onChange(value || "")}
    />
  );
};

const PlainEditor = ({ currentCode, onChange }: CodeInputProps) => {
  return (
    <textarea
      className="code-input"
      value={currentCode}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const CodeInput = (props: CodeInputProps) => {
  const { useMonaco } = props;

  return (
    <div className="code-input">
      {useMonaco ? <MonacoEditor {...props} /> : <PlainEditor {...props} />}
    </div>
  );
};
