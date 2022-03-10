import classnames from 'classnames'
import React from 'react'
import {ComponentProps, Merge} from './utils/types'
import TextInputWrapper, {StyledWrapperProps} from './_TextInputWrapper'
import UnstyledTextInput from './_UnstyledTextInput'

type NonPassthroughProps = {
  className?: string
  /** @deprecated Use `leadingVisual` or `trailingVisual` prop instead */
  icon?: React.ComponentType<{className?: string}>
  leadingVisual?: string | React.ComponentType<{className?: string}>
  trailingVisual?: string | React.ComponentType<{className?: string}>
} & Pick<
  StyledWrapperProps,
  'block' | 'contrast' | 'disabled' | 'sx' | 'width' | 'maxWidth' | 'minWidth' | 'variant' | 'size' | 'validationStatus'
>

type TextInputInternalProps = Merge<React.ComponentPropsWithoutRef<'input'>, NonPassthroughProps>

// using forwardRef is important so that other components (ex. SelectMenu) can autofocus the input
const TextInput = React.forwardRef<HTMLInputElement, TextInputInternalProps>(
  (
    {
      icon: IconComponent,
      leadingVisual: LeadingVisual,
      trailingVisual: TrailingVisual,
      block,
      className,
      contrast,
      disabled,
      validationStatus,
      sx: sxProp,
      size: sizeProp,
      // start deprecated props
      width: widthProp,
      minWidth: minWidthProp,
      maxWidth: maxWidthProp,
      variant: variantProp,
      // end deprecated props
      ...inputProps
    },
    ref
  ) => {
    // this class is necessary to style FilterSearch, plz no touchy!
    const wrapperClasses = classnames(className, 'TextInput-wrapper')

    return (
      <TextInputWrapper
        block={block}
        className={wrapperClasses}
        validationStatus={validationStatus}
        contrast={contrast}
        disabled={disabled}
        sx={sxProp}
        size={sizeProp}
        width={widthProp}
        minWidth={minWidthProp}
        maxWidth={maxWidthProp}
        variant={variantProp}
        hasLeadingVisual={Boolean(LeadingVisual)}
        hasTrailingVisual={Boolean(TrailingVisual)}
      >
        {IconComponent && <IconComponent className="TextInput-icon" />}
        {LeadingVisual && (
          <span className="TextInput-icon">
            {typeof LeadingVisual === 'function' ? <LeadingVisual /> : LeadingVisual}
          </span>
        )}
        <UnstyledTextInput ref={ref} disabled={disabled} {...inputProps} data-component="input" />
        {TrailingVisual && (
          <span className="TextInput-icon">
            {typeof TrailingVisual === 'function' ? <TrailingVisual /> : TrailingVisual}
          </span>
        )}
      </TextInputWrapper>
    )
  }
)

TextInput.defaultProps = {
  type: 'text'
}

TextInput.displayName = 'TextInput'

export type TextInputProps = ComponentProps<typeof TextInput>
export default TextInput
