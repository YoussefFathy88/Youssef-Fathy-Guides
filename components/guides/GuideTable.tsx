import { cn } from "@/lib/utils";

type GuideTableProps = {
  columns: string[];
  rows: string[][];
};

/* In a "Who" column, cells read as pills: green for the AI, black for you. */
function Cell({ value, isWho }: { value: string; isWho: boolean }) {
  if (isWho && value === "AI") {
    return (
      <span className="inline-flex rounded-full bg-brand px-3 py-1 text-base font-semibold text-white">
        AI
      </span>
    );
  }

  if (isWho && value.startsWith("You")) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-base font-semibold text-background">
        {value}
      </span>
    );
  }

  return <>{value}</>;
}

export function GuideTable({ columns, rows }: GuideTableProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-border-subtle">
      <table className="w-full min-w-[520px] border-collapse text-left text-lg">
        <thead className="bg-background-elevated">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-4 text-base font-bold text-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border-subtle">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-5 py-4 align-top leading-relaxed",
                    cellIndex === 0 ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Cell value={cell} isWho={columns[cellIndex] === "Who"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
