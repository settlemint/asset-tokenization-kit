import { kycDeleteContract } from "./routes/kyc.delete.contract";
import { kycListContract } from "./routes/kyc.list.contract";
import { kycReadContract } from "./routes/kyc.read.contract";
import { kycUpsertContract } from "./routes/kyc.upsert.contract";

export const kycContract = {
  list: kycListContract,
  read: kycReadContract,
  upsert: kycUpsertContract,
  remove: kycDeleteContract,
};
