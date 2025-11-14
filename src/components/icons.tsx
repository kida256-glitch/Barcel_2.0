import type { SVGProps } from 'react';

export const CeloBargainLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15 18C13.3431 18 12 16.6569 12 15V9C12 7.34315 13.3431 6 15 6H17C18.6569 6 20 7.34315 20 9V15C20 16.6569 18.6569 18 17 18H15Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 6H9C7.34315 6 6 7.34315 6 9V15C6 16.6569 7.34315 18 9 18H12"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M12 12H16" stroke="currentColor" strokeWidth="2" />
  </svg>
);
