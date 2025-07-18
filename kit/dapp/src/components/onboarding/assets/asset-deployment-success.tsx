import { memo } from "react";
import { getAssetIcon } from "./asset-icons";

interface DeployedFactory {
  id: string;
  name: string;
  typeId: string;
}

interface AssetDeploymentSuccessProps {
  title: string;
  deployedFactoriesLabel: string;
  factories: DeployedFactory[];
}

export const AssetDeploymentSuccess = memo(
  ({
    title,
    deployedFactoriesLabel,
    factories,
  }: AssetDeploymentSuccessProps) => {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium text-green-800 dark:text-green-300">
            {title}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {deployedFactoriesLabel}
          </p>
          <div className="grid gap-2">
            {factories.map((factory) => {
              const IconComponent = getAssetIcon(factory.typeId);
              return (
                <div
                  key={factory.id}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{factory.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

AssetDeploymentSuccess.displayName = "AssetDeploymentSuccess";
