import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateCell } from "@/components/data-table/cells/date-cell";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { Mail, Calendar, Clock, User as UserIcon, Shield } from "lucide-react";

interface UserBasicInfoCardProps {
  user: User;
}

/**
 * Card component displaying basic user information
 * 
 * Shows essential user details including personal information,
 * account creation date, and last login information.
 */
export function UserBasicInfoCard({ user }: UserBasicInfoCardProps) {

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Full Name
            </p>
            <p className="text-base font-medium">{displayName}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </p>
            <p className="text-base">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Role
            </p>
            <Badge variant="secondary" className="w-fit">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Account Created */}
        {user.createdAt && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Account Created
              </p>
              <DateCell value={user.createdAt} />
            </div>
          </div>
        )}

        {/* Last Login */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last Login
            </p>
            <DateCell 
              value={user.lastLoginAt} 
              fallback="Never logged in" 
              relative 
            />
          </div>
        </div>

        {/* First Name & Last Name (if different from display name) */}
        {user.firstName && user.lastName && (
          <>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                KYC Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    First Name
                  </p>
                  <p className="text-sm">{user.firstName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Last Name
                  </p>
                  <p className="text-sm">{user.lastName}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}