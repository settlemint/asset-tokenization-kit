import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export interface EmailTemplateClassNames {
  body?: string;
  button?: string;
  container?: string;
  content?: string;
  footer?: string;
  heading?: string;
  hr?: string;
  link?: string;
}

export interface EmailTemplateProps {
  classNames?: EmailTemplateClassNames;
  action: string;
  content: ReactNode;
  heading: ReactNode;
  preview?: string;
  url: string;
}

export const EmailTemplate = ({
  classNames,
  action,
  content,
  heading,
  preview,
  url,
}: EmailTemplateProps) => {
  const imageUrl = `${siteConfig.url}/logos/settlemint-logo-i-lm.svg`;
  preview = preview || (typeof heading === "string" ? heading : undefined);

  return (
    <Html>
      <Head>
        <meta name="x-apple-disable-message-reformatting" />
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />

        <style type="text/css">
          {`
                      :root {
                          color-scheme: light dark;
                          supported-color-schemes: light dark;
                      }
                  `}
        </style>

        <style type="text/css">
          {`
                      html, body {
                          background-color: oklch(0.967 0.014 268.49);
                          color: oklch(0.2264 0 87);
                      }
                      a {
                          color: oklch(0.5745 0.2028 263.15);
                      }
                      .border-color {
                          border-color: oklch(0.2264 0 87 / 12%);
                      }
                      .action-button {
                          background-color: oklch(0.5745 0.2028 263.15) !important;
                          color: oklch(0.2264 0 87) !important;
                          border-radius: 0.625rem;
                      }
                      .container-gradient {
                          background: linear-gradient(45deg, oklch(0.9886 0.0026 286.35) 0%, oklch(0.9691 0.0103 261.79) 100%);
                          box-shadow: 0 5px 15px oklch(0.5745 0.2028 263.15 / 0.12);
                      }
                      .footer-text {
                          color: oklch(0.2264 0 87 / 32%);
                      }
                      @media (prefers-color-scheme: dark) {
                          html, body {
                              background-color: oklch(0.2809 0 0) !important;
                              color: oklch(1 0 87) !important;
                          }
                          a {
                              color: oklch(0.6219 0.1772 263.65);
                          }
                          .border-color {
                              border-color: oklch(1 0 87 / 12%) !important;
                          }
                          .action-button {
                              background-color: oklch(0.6219 0.1772 263.65) !important;
                              color: oklch(1 0 87) !important;
                          }
                          .container-gradient {
                              background: linear-gradient(45deg, oklch(0.3368 0 0) 0%, oklch(0.3092 0 0) 100%) !important;
                              box-shadow: 0 5px 15px oklch(0.2264 0 0) !important;
                          }
                          .footer-text {
                              color: oklch(1 0 87 / 32%) !important;
                          }
                      }
                  `}
        </style>
      </Head>

      {preview && <Preview>{preview}</Preview>}

      <Tailwind>
        <Body
          className={cn("mx-auto my-auto px-2 font-sans", classNames?.body)}
        >
          <Container className="container-gradient mx-auto my-[40px] max-w-[465px] rounded-xl border border-color border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                alt={siteConfig.name}
                className="mx-auto my-0 rounded-full"
                height="40"
                src={imageUrl}
                width="40"
              />
            </Section>

            <Heading
              className={cn(
                "mx-0 my-[30px] p-0 text-center font-bold text-[24px]",
                classNames?.heading
              )}
            >
              {heading}
            </Heading>

            <Text
              className={cn("text-[14px] leading-[24px]", classNames?.content)}
            >
              {content}
            </Text>

            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className={cn(
                  "action-button px-5 py-3 text-center font-semibold text-[12px] no-underline",
                  classNames?.button
                )}
                href={url}
              >
                {action}
              </Button>
            </Section>

            <Hr
              className={cn(
                "mx-0 my-[26px] w-full border border-color border-solid",
                classNames?.hr
              )}
            />

            <Text
              className={cn(
                "footer-text text-[12px] leading-[24px]",
                classNames?.footer
              )}
            >
              {siteConfig.name && <>{siteConfig.name} </>}

              {siteConfig.url && (
                <Link
                  className={cn("no-underline", classNames?.link)}
                  href={siteConfig.url}
                  style={{ color: "inherit" }}
                >
                  {siteConfig.url
                    .replace("https://", "")
                    .replace("http://", "")}
                </Link>
              )}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
