interface SolidityIconProps {
  className?: string;
}

/**
 * Solidity icon component that renders an SVG logo with theme-aware colors.
 *
 * This component displays the official Solidity programming language logo,
 * automatically adapting its colors based on the current theme (light/dark).
 * The icon consists of multiple geometric shapes with varying opacity levels
 * to create the distinctive Solidity diamond pattern.
 * @param {object} props - The component props
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element
 * @returns {JSX.Element} A React component that renders the Solidity icon as an SVG
 */
export function SolidityIcon({ className }: SolidityIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1468 2500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.45">
        <path
          d="M1101.1 0L733.9 660.4L550.3 330.2L1101.1 0Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.6">
        <path d="M366.7 0H917.5L733.9 330.2L366.7 0Z" fill="currentColor" />
      </g>
      <g opacity="0.8">
        <path
          d="M1284.7 330.2L1101.1 660.4L733.9 0H1284.7V330.2Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.45">
        <path
          d="M550.3 990.6L733.9 660.4L1101.1 1320.8L550.3 990.6Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.6">
        <path
          d="M733.9 990.6L1101.1 1320.8H550.3L733.9 990.6Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.8">
        <path
          d="M183.1 990.6L366.7 660.4L733.9 1320.8H183.1V990.6Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.45">
        <path
          d="M366.7 2500L733.9 1839.6L917.5 2169.8L366.7 2500Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.6">
        <path
          d="M1101.1 2500H550.3L733.9 2169.8L1101.1 2500Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.8">
        <path
          d="M183.1 2169.8L366.7 1839.6L733.9 2500H183.1V2169.8Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.45">
        <path
          d="M917.5 1509.4L733.9 1839.6L366.7 1179.2L917.5 1509.4Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.6">
        <path
          d="M733.9 1509.4L366.7 1179.2H917.5L733.9 1509.4Z"
          fill="currentColor"
        />
      </g>
      <g opacity="0.8">
        <path
          d="M1284.7 1509.4L1101.1 1839.6L733.9 1179.2H1284.7V1509.4Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
