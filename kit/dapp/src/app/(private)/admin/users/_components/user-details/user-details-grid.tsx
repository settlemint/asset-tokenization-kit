import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CopyToClipboard } from "@/components/ui/copy";
import { formatDate } from "@/lib/date";
import { shortHex } from "@/lib/hex";
import type { User } from "../data";

export function UserDetailsGrid({
	data,
}: {
	data: User;
}) {
	return (
		<Card className="py-4">
			<CardContent className="grid grid-cols-6 gap-x-4 gap-y-8">
				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Name</span>
					<div className="text-md">{data.name}</div>
				</div>

				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Email</span>
					<div className="text-md">{data.email}</div>
				</div>

				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Status</span>
					<div className="text-md">{data.banned ? "Banned" : "Active"}</div>
				</div>

				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Created At</span>
					<div className="text-md">{formatDate(data.created_at as string)}</div>
				</div>

				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Verified At</span>
					<div className="text-md">{data.kyc_verified ? formatDate(data.kyc_verified as string) : "Not Verified"}</div>
				</div>

				<div className="space-y-1">
					<span className="font-medium text-muted-foreground text-sm">Wallet</span>
					<div className="flex items-center gap-2 text-md">
						<AddressAvatar address={data.wallet} variant="small" />
						<CopyToClipboard
							value={data.wallet}
							displayText={shortHex(data.wallet, { prefixLength: 12, suffixLength: 8 }) ?? ""}
							className="ml-2"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
