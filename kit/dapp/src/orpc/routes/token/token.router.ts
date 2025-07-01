import { bondCreate } from "@/orpc/routes/token/routes/bond/bond.create";
import { depositCreate } from "@/orpc/routes/token/routes/deposit/deposit.create";
import { factoryCreate } from "@/orpc/routes/token/routes/factory.create";
import { factoryGrantRole } from "@/orpc/routes/token/routes/factory.grant-role";
import { factoryList } from "@/orpc/routes/token/routes/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory.read";
import { list } from "@/orpc/routes/token/routes/token.list";
import { mint } from "@/orpc/routes/token/routes/token.mint";
import { read } from "@/orpc/routes/token/routes/token.read";

const routes = {
  bondCreate,
  depositCreate,
  factoryCreate,
  factoryGrantRole,
  factoryList,
  factoryRead,
  list,
  read,
  mint,
};

export default routes;
