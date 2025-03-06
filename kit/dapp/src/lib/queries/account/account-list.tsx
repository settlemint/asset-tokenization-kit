import {
  theGraphClientKits,
  theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";

const AccountList = theGraphGraphqlKits(
  // ... existing code ...
);

const result = await theGraphClientKits.request(AccountList, {
  // ... existing code ...
});