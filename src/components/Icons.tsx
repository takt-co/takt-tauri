import React, { SVGAttributes } from "react";

export type IconProps = SVGAttributes<SVGElement>;

export const AddIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <path d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z" />
    </svg>
  );
};

export const Arrow = (props: IconProps) => {
  return (
    <svg viewBox="0 0 96 96" {...props}>
      <path d="M69.8437,43.3876,33.8422,13.3863a6.0035,6.0035,0,0,0-7.6878,9.223l30.47,25.39-30.47,25.39a6.0035,6.0035,0,0,0,7.6878,9.2231L69.8437,52.6106a6.0091,6.0091,0,0,0,0-9.223Z"/>
    </svg>
  )
};

// export const BinIcon = (props: IconProps) => {
//   return (
//     <svg viewBox="0 0 24 24" {...props}>
//       <path d="M18,22H6V8H4v13.7C4,22.8,4.9,24,6,24h12c1.1,0,2-1.2,2-2.3V8h-2V22z M15,4V2H9v2H2v2h20V4H15z M9,10v10h2V10H9  z M13,10v10h2V10H13z" />
//     </svg>
//   );
// };

export const CalendarIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 512 512" {...props}>
      <path d="M448.9,64H416v40.7c0,22.5-23.2,39.3-47.2,39.3S320,127.2,320,104.7V64H192v40.7c0,22.5-24,39.3-48,39.3s-48-16.8-48-39.3  V64H63.1C45.9,64,32,77.3,32,93.4v357.5C32,467,45.9,480,63.1,480h385.8c17.2,0,31.1-13,31.1-29.2V93.4C480,77.3,466.1,64,448.9,64z   M432,419.9c0,6.6-5.8,12-12.8,12L92.7,432c-7-0.3-12.7-5.6-12.7-12.2V188.3c0-6.9,5.9-12.3,13.3-12.3h325.5  c7.3,0,13.2,5.3,13.2,12.1V419.9z"/>
      <path d="M176,96c0,17.7-14.3,32-32,32l0,0c-17.7,0-32-14.3-32-32V64c0-17.7,14.3-32,32-32l0,0c17.7,0,32,14.3,32,32V96z"/>
      <path d="M400,96c0,17.7-14.3,32-32,32l0,0c-17.7,0-32-14.3-32-32V64c0-17.7,14.3-32,32-32l0,0c17.7,0,32,14.3,32,32V96z"/>
    </svg>
  );
};

// export const ClearIcon = (props: IconProps) => {
//   return (
//     <svg viewBox="0 0 48 48" {...props}>
//       <path d="M38 12.83l-2.83-2.83-11.17 11.17-11.17-11.17-2.83 2.83 11.17 11.17-11.17 11.17 2.83 2.83 11.17-11.17 11.17 11.17 2.83-2.83-11.17-11.17z" />
//       <path d="M0 0h48v48h-48z" fill="none" />
//     </svg>
//   );
// };

// export const EditIcon = (props: IconProps) => {
//   return (
//     <svg viewBox="0 0 16 16" {...props}>
//       <path d="M2.453,9.297C1.754,9.996,1,13.703,1,14c0,0.521,0.406,1,1,1c0.297,0,4.004-0.754,4.703-1.453l5.722-5.722l-4.25-4.25  L2.453,9.297z M12,1c-0.602,0-1.449,0.199-2.141,0.891L9.575,2.175l4.25,4.25l0.284-0.284C14.746,5.504,15,4.695,15,4  C15,2.343,13.656,1,12,1z" />
//     </svg>
//   );
// };

export const MinusCircled = (props: IconProps) => (
  <svg viewBox="0 0 32 32" {...props}>
    <g>
      <path d="M16,29A13,13,0,1,1,29,16,13,13,0,0,1,16,29ZM16,5A11,11,0,1,0,27,16,11,11,0,0,0,16,5Z"/>
      <path d="M22,17H10a1,1,0,0,1,0-2H22a1,1,0,0,1,0,2Z"/>
    </g>
    <g>
      <rect fill="none" height="32" width="32"/>
    </g>
  </svg>
)

export const PlusCircled = (props: IconProps) => (
  <svg viewBox="0 0 32 32" {...props}>
    <g>
      <path d="M16,29A13,13,0,1,1,29,16,13,13,0,0,1,16,29ZM16,5A11,11,0,1,0,27,16,11,11,0,0,0,16,5Z"/>
      <path d="M16,23a1,1,0,0,1-1-1V10a1,1,0,0,1,2,0V22A1,1,0,0,1,16,23Z"/>
      <path d="M22,17H10a1,1,0,0,1,0-2H22a1,1,0,0,1,0,2Z"/>
    </g>
    <g>
      <rect fill="none" height="32" width="32"/>
    </g>
  </svg>
)

// export const TickIcon = (props: IconProps) => {
//   return (
//     <svg viewBox="0 0 64 64" {...props}>
//       <path d="M21.33,57.82,0,36.53l5.87-5.87L21.33,46.09,58.13,9.36,64,15.23,21.33,57.82" />
//     </svg>
//   );
// };

export const SaveIcon = (props: IconProps) => (
  <svg viewBox="0 0 18 18" {...props}>
    <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">
      <g fill={props.fill} id="Core" transform="translate(-255.000000, -381.000000)">
        <g id="save" transform="translate(255.000000, 381.000000)">
          <path d="M14,0 L2,0 C0.9,0 0,0.9 0,2 L0,16 C0,17.1 0.9,18 2,18 L16,18 C17.1,18 18,17.1 18,16 L18,4 L14,0 L14,0 Z M9,16 C7.3,16 6,14.7 6,13 C6,11.3 7.3,10 9,10 C10.7,10 12,11.3 12,13 C12,14.7 10.7,16 9,16 L9,16 Z M12,6 L2,6 L2,2 L12,2 L12,6 L12,6 Z" id="Shape"/>
        </g>
      </g>
    </g>
  </svg>
)