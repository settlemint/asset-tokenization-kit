import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getContactDetail } from "@/lib/queries/contact/contact-detail";
import { getContactsList } from "@/lib/queries/contact/contact-list";
import { ContactSchema } from "@/lib/queries/contact/contact-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia, NotFoundError } from "elysia";

export const ContactApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async ({ session }) => {
      return await getContactsList(session.userId);
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all contacts for the authenticated user.",
        tags: ["contact"],
      },
      response: {
        200: t.Array(ContactSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, session }) => {
      const contact = await getContactDetail({
        id,
        userId: session.userId,
      });

      if (!contact) {
        throw new NotFoundError("Contact not found");
      }

      return contact;
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves details of a specific contact for the authenticated user.",
        tags: ["contact"],
      },
      params: t.Object({
        id: t.String({
          description: "The ID of the contact",
        }),
      }),
      response: {
        200: ContactSchema,
        ...defaultErrorSchema,
      },
    }
  );
