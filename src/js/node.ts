export type Position = {
  bytes: number;
  line: number;
  character: number;
};

export type Node = {
  start_position?: Position;
  end_position?: Position;
  [key: string]: unknown;
};
