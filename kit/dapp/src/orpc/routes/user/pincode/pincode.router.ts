import { remove } from "@/orpc/routes/user/pincode/pincode.remove";
import { set } from "@/orpc/routes/user/pincode/pincode.set";
import { update } from "@/orpc/routes/user/pincode/pincode.update";

const routes = {
  set,
  update,
  remove,
};

export default routes;
