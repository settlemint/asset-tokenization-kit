import { trustedIssuerCreate as create } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create";
import { trustedIssuerDelete as remove } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.delete";
import { trustedIssuerList as list } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list";
import { trustedIssuerUpdate as update } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.update";

const routes = {
  list,
  create,
  update,
  delete: remove,
};

export default routes;
