import React, { useEffect, useState } from "react";

import { Node, Position } from "../node";

// @ts-ignore
import { parse } from "../../full-moon-extract/Cargo.toml";

type ParseResult =
  | {
      type: "Ok";
      ast: Node;
    }
  | ({
      type: "Err";
    } & ParseResultErr);

type ParseResultErr = {
  error: { [key: string]: unknown };
  display: string;
};

const NodeDisplay = ({
  node,
  onHover,
  onUnhover,
  compactTokens,
  currentHover,
  level = 0,
}: {
  node: Node;
  onHover: (level: number, node: Node) => void;
  onUnhover: (level: number, node: Node) => void;
  compactTokens: boolean;
  currentHover?: unknown;
  isToken?: boolean;
  level?: number;
}) => {
  return (
    <ul className="node-display">
      {Object.entries(node)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          let display;

          if (Array.isArray(value) && value.length === 0) {
            display = ": []";
          } else if (value === null) {
            display = ": null";
          } else if (typeof value === "string") {
            display = `: "${value}"`;
          } else if (typeof value === "number") {
            display = `: ${value}`;
          } else if (typeof value === "object") {
            if (Object.keys(value).length === 0) {
              display = ": {}";
            } else {
              // Hovering tokens should be the same as hovering this
              const isToken = "start_position" in value;

              const nextOnHover = isToken
                ? () => onHover(level, node)
                : onHover;

              const nextOnUnhover = isToken
                ? () => onUnhover(level, node)
                : onUnhover;

              display =
                isToken && compactTokens ? (
                  <CompactToken
                    node={
                      value as Node & {
                        start_position: Position;
                        end_position: Position;
                        token_type: Node;
                      }
                    }
                    onHover={nextOnHover}
                    onUnhover={nextOnUnhover}
                  />
                ) : (
                  <NodeDisplay
                    node={value as { [key: string]: unknown }}
                    onHover={nextOnHover}
                    onUnhover={nextOnUnhover}
                    currentHover={currentHover}
                    compactTokens={compactTokens}
                    level={level + 1}
                  />
                );
            }
          } else {
            display = ": unknown";
          }

          return (
            <li
              key={key}
              className={`node-display-item ${
                currentHover === value ? "node-display-item-hovered" : ""
              }`}
              onMouseEnter={() => {
                onHover(level, node);
              }}
              onMouseLeave={() => {
                onUnhover(level, node);
              }}
            >
              {key}
              {display}
            </li>
          );
        })}
    </ul>
  );
};

const CompactToken = ({
  node,
  onHover,
  onUnhover,
}: {
  node: Node & {
    start_position: Position;
    end_position: Position;
    token_type: Node;
  };
  onHover: (level: number, node: Node) => void;
  onUnhover: (level: number, node: Node) => void;
}) => {
  const display = (position: Position) => {
    return `${position.line}:${position.character} (${position.bytes})`;
  };

  return (
    <>
      {" "}
      @ {display(node.start_position)} - {display(node.end_position)}
      <ul>
        <li>
          token_type
          <NodeDisplay
            node={node.token_type}
            onHover={onHover}
            onUnhover={onUnhover}
            isToken={true}
            compactTokens={true}
          />
        </li>
      </ul>
    </>
  );
};

const ErrorDisplay = ({ parseResult }: { parseResult: ParseResultErr }) => {
  return (
    <div className="error-display">
      <pre style={{ color: "red" }}>{parseResult.display}</pre>
    </div>
  );
};

export const AstDisplay = ({
  autoUpdate,
  code,
  compactTokens,
  currentHover,
  setCurrentHover,
}: {
  autoUpdate: boolean;
  code: string;
  compactTokens: boolean;
  currentHover?: unknown;
  setCurrentHover: (node: { [key: string]: unknown } | undefined) => void;
}) => {
  const [lastCode, setLastCode] = useState(code);

  const [parseResult, setParseResult] = useState<ParseResult>(() => {
    return parse(code);
  });

  const [lastSuccessfulParseResult, setLastSuccessfulParseResult] = useState(
    () => {
      if (parseResult.type === "Ok") {
        return parseResult;
      } else {
        return parse("");
      }
    }
  );

  useEffect(() => {
    if (autoUpdate) {
      setLastCode(code);
    }
  }, [code, autoUpdate]);

  useEffect(() => {
    const parseResult = parse(lastCode);
    setParseResult(parseResult);

    if (parseResult.type === "Ok") {
      setLastSuccessfulParseResult(parseResult);
    }
  }, [lastCode]);

  const [hovers, setHovers] = useState<{ [key: string]: unknown }[][]>([]);

  useEffect(() => {
    const lastHover = hovers[hovers.length - 1];
    if (lastHover) {
      setCurrentHover(lastHover[lastHover.length - 1]);
    } else {
      setCurrentHover(undefined);
    }
  }, [hovers]);

  return (
    <div className="ast-display">
      {parseResult.type === "Err" && <ErrorDisplay parseResult={parseResult} />}

      <NodeDisplay
        node={lastSuccessfulParseResult.ast}
        currentHover={currentHover}
        compactTokens={compactTokens}
        onHover={(level, node) => {
          setHovers((hovers) => {
            const newHovers = [...hovers];

            if (newHovers[level]) {
              newHovers[level] = [...newHovers[level], node];
            } else {
              newHovers[level] = [node];
            }

            return newHovers;
          });
        }}
        onUnhover={(level, node) => {
          setHovers((hovers) => {
            const newHovers = [...hovers];

            newHovers[level] = (newHovers[level] || []).filter(
              (hover) => hover !== node
            );

            if (newHovers[level].length === 0) {
              for (let index = level + 1; index < newHovers.length; index++) {
                if (newHovers[index].length > 0) {
                  return newHovers;
                }
              }

              newHovers.length = level;
              return newHovers;
            }

            return newHovers;
          });
        }}
      />
    </div>
  );
};
