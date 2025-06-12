import { WelcomeCard } from "@/components/blocks/welcome-card/welcome-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  ChartPie,
  CheckCircle,
  Clock,
  ExternalLink,
  HandCoins,
  MoreHorizontal,
  Plus,
  Send,
  Settings,
  SquareStack,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <WelcomeCard />
      <div className="grid gap-6 grid-cols-[1fr_2fr_2fr] h-[calc(100vh-16rem)]">
        {/* Quick Actions Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              <Button
                className="flex items-center gap-2 h-12 w-full"
                variant="default"
              >
                <Plus className="h-4 w-4" />
                Create Token
              </Button>
              <Button
                className="flex items-center gap-2 h-12 w-full"
                variant="outline"
              >
                <Send className="h-4 w-4" />
                Transfer Assets
              </Button>
              <Button
                className="flex items-center gap-2 h-12 w-full"
                variant="outline"
              >
                <ChartPie className="h-4 w-4" />
                View Portfolio
              </Button>
              <Button
                className="flex items-center gap-2 h-12 w-full"
                variant="outline"
              >
                <SquareStack className="h-4 w-4" />
                Manage Tokens
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-t mt-auto">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">Need help?</span>
              <Button variant="ghost" size="sm" className="text-sm">
                View Guide
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Your Tasks Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Tasks
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {/* Pending Task */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">
                      Complete KYC Verification
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Required for token creation
                    </p>
                  </div>
                </div>
                <Badge className="bg-warning text-warning-foreground">
                  Pending
                </Badge>
              </div>

              {/* Completed Task */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-success/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-success-fg-deep" />
                  <div>
                    <p className="text-sm font-medium">Wallet Connected</p>
                    <p className="text-xs text-muted-foreground">
                      Completed 2 hours ago
                    </p>
                  </div>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Completed
                </Badge>
              </div>

              {/* Overdue Task */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-destructive/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Review Token Compliance
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due 1 day ago
                    </p>
                  </div>
                </div>
                <Badge className="bg-destructive text-destructive-foreground">
                  Overdue
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t mt-auto">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">
                3 of 5 tasks completed
              </span>
              <Button variant="ghost" size="sm" className="text-sm">
                View All
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Recent Activity Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {/* Recent Activity Items */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Token Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Transferred 100 PROP tokens to 0x742...d4f2
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">2 min ago</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    0x1a2b...9f8e
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Token Created</p>
                    <p className="text-xs text-muted-foreground">
                      Created REAL token (Real Estate Asset Token)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    0x3c4d...7a1b
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Approval Granted</p>
                    <p className="text-xs text-muted-foreground">
                      Approved spending of PROP tokens for DeFi protocol
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    0x5e6f...3c2d
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Wallet Connected</p>
                    <p className="text-xs text-muted-foreground">
                      Connected MetaMask wallet (0x742...d4f2)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t mt-auto">
            <div className="flex justify-center w-full">
              <Button variant="ghost" size="sm" className="text-sm">
                View All Activity
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
