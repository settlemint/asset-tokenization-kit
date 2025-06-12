import { Card, CardContent } from "@/components/ui/card";

const messages = {
  user: {
    first_time: [
      "Welcome, Roderik — your portfolio’s all set. No assets yet, but you're ready to track, explore, and start building.",
      "Hey Roderik, good to have you — nothing in the portfolio yet, but you’re cleared to monitor any incoming assets.",
      "First time here? Your portfolio's ready. Start exploring assets or sit back and watch updates roll in.",
      "Welcome to your portfolio hub, Roderik. It's empty for now, but everything’s in place to start tracking.",
      "You're in, Roderik — portfolio’s live and ready. No holdings yet, but you're good to go when they arrive.",
    ],
    returning: [
      "Welcome back, Roderik! You’re tracking 3 assets worth €1.2M — no major moves since your last visit.",
      "Back again? Portfolio looks solid with 2 active assets and no recent activity — all stable.",
      "Hey Roderik, nothing new in your portfolio today — still holding steady at €1.2M across 3 assets.",
      "Nice to see you again — your portfolio’s unchanged and up to date. Everything’s right where you left it.",
      "You're back! Portfolio's holding 3 assets — no updates, but performance remains steady.",
    ],
  },
  issuer: {
    first_time: [
      "Welcome aboard, Roderik — your dashboard is ready to issue and manage assets. Let’s get your first one live.",
      "Good to have you, Roderik — your toolkit is active. Start issuing assets, invite investors, and take control.",
      "You're set up to issue, track, and manage assets. Start with your first issuance or check out investor tools.",
      "Hi Roderik — you’ve got full asset management access. Ready when you are to create and manage your first product.",
      "Your workspace is ready, Roderik — from issuance to investor updates, everything starts here.",
    ],
    returning: [
      "Welcome back, Roderik — 4 active assets, €2.8M issued, and 2 new investor updates since you last logged in.",
      "Back in action — you’re managing 4 assets and your investor pipeline just ticked up with 1 new registration.",
      "Hey Roderik, portfolio’s holding at €2.8M. You’ve got 3 pending actions and 1 investor note to review.",
      "You're back — issuance holding strong, no red flags, and 1 new document uploaded by an investor.",
      "Welcome back — 4 assets live, 3 jurisdictions covered, and 2 new investor events waiting for your review.",
    ],
  },
  admin: {
    first_time: [
      "Welcome to the platform command center, Roderik — full control is yours. Set up teams, onboard users, and configure workflows.",
      "You're in, Roderik — as admin, you control the full stack. Users, assets, permissions — it all starts here.",
      "Hi Roderik — admin access unlocked. Ready to shape how assets are issued, managed, and monitored across the platform.",
      "Welcome to your admin dashboard — no assets live yet, but your full governance and setup tools are ready.",
      "First time here? You're in control — define settings, add issuers, and oversee platform health from this view.",
    ],
    returning: [
      "Back on deck, Roderik — platform’s running with 18 users, 12 live assets, and €14.3M in AUM. 1 onboarding request is waiting.",
      "Welcome back — activity looks steady: 3 compliance alerts, 2 flagged actions, and system health is green.",
      "Hey Roderik, since your last login: 2 new users onboarded, 1 asset update, and 1 flagged investor action.",
      "You're back — dashboard shows 12 active assets, 18 users, and no system issues. 2 pending admin tasks await.",
      "Good to see you — platform is stable, user activity is up, and there’s 1 key alert in the compliance center.",
    ],
  },
};

const getMessage = (
  role: keyof typeof messages,
  type: keyof (typeof messages)[typeof role]
) => {
  const message = messages[role][type];
  return message[Math.floor(Math.random() * message.length)];
};

export function WelcomeCard() {
  return (
    <>
      <Card className="linear-gradient-highlight">
        <CardContent>
          <div className="text-2xl">{getMessage("issuer", "returning")}</div>
        </CardContent>
      </Card>
    </>
  );
}
