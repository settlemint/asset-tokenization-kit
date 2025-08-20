import { baseContract } from "@/orpc/procedures/base.contract";
import { PincodeRemoveOutputSchema } from "@/orpc/routes/user/pincode/pincode.remove.schema";
import {
  PincodeSetInputSchema,
  PincodeSetOutputSchema,
} from "@/orpc/routes/user/pincode/pincode.set.schema";
import {
  PincodeUpdateInputSchema,
  PincodeUpdateOutputSchema,
} from "@/orpc/routes/user/pincode/pincode.update.schema";

const set = baseContract
  .route({
    method: "POST",
    path: "/user/pincode",
    description: "Set pincode for the user",
    successDescription: "Pincode set successfully",
    tags: ["user", "security"],
  })
  .input(PincodeSetInputSchema)
  .output(PincodeSetOutputSchema);

const update = baseContract
  .route({
    method: "PATCH",
    path: "/user/pincode",
    description: "Update pincode for the user",
    successDescription: "Pincode updated successfully",
    tags: ["user", "security"],
  })
  .input(PincodeUpdateInputSchema)
  .output(PincodeUpdateOutputSchema);

const remove = baseContract
  .route({
    method: "DELETE",
    path: "/user/pincode",
    description: "Remove pincode for the user",
    successDescription: "Pincode removed successfully",
    tags: ["user", "security"],
  })
  .output(PincodeRemoveOutputSchema);

export const pincodeContract = {
  set,
  update,
  remove,
};
