import { FUNDING_ROUTES, ROUTE_STATUS, type RouteStatus } from "@/lib/constants";

const stampClass: Record<RouteStatus, string> = {
  tested: "stamp-tested",
  listed: "stamp-listed",
  unavailable: "stamp-none",
};

export function RouteStamp({ status }: { status: RouteStatus }) {
  return (
    <span className={`stamp ${stampClass[status]}`}>
      <span>{ROUTE_STATUS[status].label}</span>
    </span>
  );
}

/* What can fund an order, and how far each route has actually been proven. */
export default function RouteTable({ notes = true }: { notes?: boolean }) {
  return (
    <div className="table-scroll">
      <table className="table min-w-[560px]">
        <thead>
          <tr>
            <th scope="col">Fund with</th>
            <th scope="col">On</th>
            <th scope="col">Status</th>
            {notes ? <th scope="col">Notes</th> : null}
          </tr>
        </thead>
        <tbody>
          {FUNDING_ROUTES.map((r) => (
            <tr key={`${r.asset}-${r.chain}`}>
              <td className="font-mono text-[13.5px] whitespace-nowrap">{r.asset}</td>
              <td className="whitespace-nowrap">{r.chain}</td>
              <td>
                <RouteStamp status={r.status} />
              </td>
              {notes ? <td className="text-[13.5px] leading-normal">{r.note}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RouteLegend() {
  return (
    <dl className="grid gap-3 sm:grid-cols-3 mt-6">
      {(Object.keys(ROUTE_STATUS) as RouteStatus[]).map((s) => (
        <div key={s}>
          <dt>
            <RouteStamp status={s} />
          </dt>
          <dd className="small mt-2">{ROUTE_STATUS[s].meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
