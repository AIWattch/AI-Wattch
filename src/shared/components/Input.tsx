import React, { useEffect, useRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  forceFocus?: boolean;
}
interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Input: React.FC<InputProps> = (props) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only focus if this input is already active
    // if (document.activeElement === ref.current) return;

    if (props.autoFocus) {
      ref.current?.click();

      ref.current?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, composed: true })
      );
      const closeButton = document.querySelector(
        '[data-testid="close-button"]'
      );

      if (closeButton) {
        // hack: close the parent modals as they steal the input focus
        closeButton.dispatchEvent(
          new MouseEvent("click", { bubbles: true, composed: true })
        );
      }

      setTimeout(() => ref.current?.focus(), 100);
    }
  }, [props.autoFocus]);

  return (
    <input
      {...props}
      onChange={(e) => {
        ref.current?.focus();
        props.onChange?.(e);
      }}
      ref={ref}
    />
  );
};

export default Input;

export const TextArea: React.FC<TextAreaProps> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => {
  //   // Only focus if this input is already active
  //   if (document.activeElement === ref.current) return;
  //   ref.current?.focus();
  // }, [props.value]);

  return (
    <textarea
      {...props}
      onChange={(e) => {
        ref.current?.focus();
        props.onChange?.(e);
      }}
      ref={ref}
    />
  );
};
