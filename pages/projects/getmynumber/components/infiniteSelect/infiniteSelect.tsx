import type { InputProps } from "../types";

export const InfiniteSelect = ({ numberToDial, phoneCheck }: InputProps) => {
  return (
    <>
      <h1>Infinite Select</h1>
      <select
        onKeyDown={(e) => {
          console.log(e);
        }}
      >
        {new Array(10000).fill(0).map((_, i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
      <select>
        {new Array(100).fill(0).map((_, i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
      <select>
        {new Array(10000).fill(0).map((_, i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
    </>
  );
};
