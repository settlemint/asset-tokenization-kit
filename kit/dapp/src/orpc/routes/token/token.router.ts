import { create } from "@/orpc/routes/token/routes/bond/bond.create";
import { list } from "@/orpc/routes/token/routes/token.list";
import { mint } from "@/orpc/routes/token/routes/token.mint";
import { read } from "@/orpc/routes/token/routes/token.read";

const routes = {
  create,
  list,
  read,
  mint,
};

export default routes;
