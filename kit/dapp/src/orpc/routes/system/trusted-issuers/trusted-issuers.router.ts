import { trustedIssuerCreate } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create";
import { trustedIssuerDelete } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.delete";
import { trustedIssuerList } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list";
import { trustedIssuerUpdate } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.update";

const routes = {
  trustedIssuerList,
  trustedIssuerCreate,
  trustedIssuerUpdate,
  trustedIssuerDelete,
};

export default routes;
