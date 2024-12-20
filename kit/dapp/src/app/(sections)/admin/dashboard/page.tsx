// TODO: the admin of the platform should be able to set a base token for the platform
//    - this will allow us to unify the prices we show
//    - this should be set in the factories as well, as soon as it is set, no pool for a token can be created without at least a pool to the base currency

export default function AdminDashboard() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Dashboard</h2>
      </div>
    </>
  );
}
