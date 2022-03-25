import React, { SVGAttributes } from "react";

export type IconProps = SVGAttributes<SVGElement>;

export const AddIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z" />
    </svg>
  );
};

export const BinIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18,22H6V8H4v13.7C4,22.8,4.9,24,6,24h12c1.1,0,2-1.2,2-2.3V8h-2V22z M15,4V2H9v2H2v2h20V4H15z M9,10v10h2V10H9  z M13,10v10h2V10H13z" />
    </svg>
  );
};

export const CalendarIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 512 512" {...props}>
      <path d="M448.9,64H416v40.7c0,22.5-23.2,39.3-47.2,39.3S320,127.2,320,104.7V64H192v40.7c0,22.5-24,39.3-48,39.3s-48-16.8-48-39.3  V64H63.1C45.9,64,32,77.3,32,93.4v357.5C32,467,45.9,480,63.1,480h385.8c17.2,0,31.1-13,31.1-29.2V93.4C480,77.3,466.1,64,448.9,64z   M432,419.9c0,6.6-5.8,12-12.8,12L92.7,432c-7-0.3-12.7-5.6-12.7-12.2V188.3c0-6.9,5.9-12.3,13.3-12.3h325.5  c7.3,0,13.2,5.3,13.2,12.1V419.9z"/>
      <path d="M176,96c0,17.7-14.3,32-32,32l0,0c-17.7,0-32-14.3-32-32V64c0-17.7,14.3-32,32-32l0,0c17.7,0,32,14.3,32,32V96z"/>
      <path d="M400,96c0,17.7-14.3,32-32,32l0,0c-17.7,0-32-14.3-32-32V64c0-17.7,14.3-32,32-32l0,0c17.7,0,32,14.3,32,32V96z"/>
    </svg>
  );
};

export const ClearIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M38 12.83l-2.83-2.83-11.17 11.17-11.17-11.17-2.83 2.83 11.17 11.17-11.17 11.17 2.83 2.83 11.17-11.17 11.17 11.17 2.83-2.83-11.17-11.17z" />
      <path d="M0 0h48v48h-48z" fill="none" />
    </svg>
  );
};

export const EditIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2.453,9.297C1.754,9.996,1,13.703,1,14c0,0.521,0.406,1,1,1c0.297,0,4.004-0.754,4.703-1.453l5.722-5.722l-4.25-4.25  L2.453,9.297z M12,1c-0.602,0-1.449,0.199-2.141,0.891L9.575,2.175l4.25,4.25l0.284-0.284C14.746,5.504,15,4.695,15,4  C15,2.343,13.656,1,12,1z" />
    </svg>
  );
};

export const TickIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21.33,57.82,0,36.53l5.87-5.87L21.33,46.09,58.13,9.36,64,15.23,21.33,57.82" />
    </svg>
  );
};
