import {
  theGraphClientKits,
  theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";

const AccountDetail = theGraphGraphqlKits(

const result = await theGraphClientKits.request(AccountDetail, {
