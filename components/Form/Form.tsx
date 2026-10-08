'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import s from './form.module.css';

/**
 * Form elements (README 5). Label above, error right under the field (above the help), linked with
 * aria-describedby. Screens own their validation; pass `error` to show it.
 */

export const formClasses = s;

type FieldBits = { label: ReactNode; help?: ReactNode; error?: string | null; className?: string };

function describedBy(id: string, error?: string | null, help?: ReactNode) {
  return [error ? `${id}-err` : null, help ? `${id}-help` : null].filter(Boolean).join(' ') || undefined;
}

function Messages({ id, error, help }: { id: string; error?: string | null; help?: ReactNode }) {
  return (
    <>
      {error ? (
        <p className={s.error} id={`${id}-err`}>
          {error}
        </p>
      ) : null}
      {help ? (
        <p className={s.help} id={`${id}-help`}>
          {help}
        </p>
      ) : null}
    </>
  );
}

type TextFieldProps = FieldBits & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & { multiline?: false };
type TextAreaProps = FieldBits & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & { multiline: true };

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps | TextAreaProps>(
  function TextField(props, ref) {
    const auto = useId();
    const { label, help, error, className, multiline, id: idProp, ...rest } = props;
    const id = idProp ?? auto;
    const common = {
      id,
      className: s.input,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': describedBy(id, error, help),
    };
    return (
      <div className={className}>
        <label className={s.label} htmlFor={id}>
          {label}
        </label>
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            {...common}
          />
        ) : (
          <input ref={ref as React.Ref<HTMLInputElement>} {...(rest as InputHTMLAttributes<HTMLInputElement>)} {...common} />
        )}
        <Messages id={id} error={error} help={help} />
      </div>
    );
  },
);

type SelectProps = FieldBits &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { options: { value: string; label: string }[] };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const auto = useId();
  const { label, help, error, className, options, id: idProp, ...rest } = props;
  const id = idProp ?? auto;
  return (
    <div className={className}>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>
      <div className={s.selectWrap}>
        <select
          ref={ref}
          {...rest}
          id={id}
          className={s.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, help)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg className={s.chev} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <Messages id={id} error={error} help={help} />
    </div>
  );
});

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  invalid?: boolean;
  className?: string;
};

/** The 18×18 box only. Wrap it in a <label> (or use `children` for the simple row). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps & { children?: ReactNode }>(function Checkbox(
  { invalid, className, children, ...rest },
  ref,
) {
  const box = (
    <input
      ref={ref}
      type="checkbox"
      {...rest}
      className={[s.checkbox, children ? null : className].filter(Boolean).join(' ')}
      aria-invalid={invalid ? true : undefined}
    />
  );
  if (!children) return box;
  return (
    <label className={[s.choice, className].filter(Boolean).join(' ')}>
      {box}
      <span>{children}</span>
    </label>
  );
});

export const Radio = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & { className?: string }>(
  function Radio({ className, ...rest }, ref) {
    return <input ref={ref} type="radio" {...rest} className={[s.radio, className].filter(Boolean).join(' ')} />;
  },
);

/**
 * Radio group: a fieldset with a legend and one row per option. `renderOption` lets a screen
 * draw its own row (checkout's payment cards); the default is the simple label row.
 */
export function RadioGroup<T extends string>({
  legend,
  legendClassName,
  name,
  value,
  onChange,
  options,
  className,
  renderOption,
  error,
}: {
  legend: ReactNode;
  legendClassName?: string;
  name: string;
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  error?: string | null;
  renderOption?: (o: { value: T; label: ReactNode }, input: ReactNode, checked: boolean) => ReactNode;
}) {
  const id = useId();
  return (
    <fieldset className={[s.group, className].filter(Boolean).join(' ')} aria-describedby={error ? `${id}-err` : undefined}>
      <legend className={legendClassName}>{legend}</legend>
      {options.map((o) => {
        const checked = value === o.value;
        const input = <Radio name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} />;
        return renderOption ? (
          <div key={o.value}>{renderOption(o, input, checked)}</div>
        ) : (
          <label key={o.value} className={s.choice}>
            {input}
            <span>{o.label}</span>
          </label>
        );
      })}
      {error ? (
        <p className={s.error} id={`${id}-err`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
