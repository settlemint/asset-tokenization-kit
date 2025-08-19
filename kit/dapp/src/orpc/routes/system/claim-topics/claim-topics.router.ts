import { topicCreate } from "@/orpc/routes/system/claim-topics/routes/topic.create";
import { topicDelete } from "@/orpc/routes/system/claim-topics/routes/topic.delete";
import { topicList } from "@/orpc/routes/system/claim-topics/routes/topic.list";
import { topicUpdate } from "@/orpc/routes/system/claim-topics/routes/topic.update";

const routes = {
  topicList,
  topicCreate,
  topicUpdate,
  topicDelete,
};

export default routes;