import { ListSchema } from '@/orpc/routes/common/schemas/list.schema';
import { UserMeSchema } from '@/orpc/routes/user/routes/user.me.schema';

export const UserListSchema = ListSchema;

export const UserListOutputSchema = UserMeSchema.array();
