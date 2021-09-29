import React, {
    ChangeEventHandler,
    FocusEventHandler,
    KeyboardEventHandler,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react'
import type * as Polymorphic from "@radix-ui/react-polymorphic"
import { AutocompleteContext } from './AutocompleteContext'
import TextInput from '../TextInput'
import { useCombinedRefs } from '../hooks/useCombinedRefs'
import { ComponentProps } from '../utils/types'

type InternalAutocompleteInputProps = {
    as?: React.ComponentType<any>
}

const AutocompleteInput = React.forwardRef(
    ({
        as: Component = TextInput,
        onFocus,
        onBlur,
        onChange,
        onKeyDown,
        onKeyPress,
        value,
        ...props
    }, forwardedRef) => {
        const {
            activeDescendantRef,
            autocompleteSuggestion = '',
            id,
            inputRef,
            inputValue = '',
            isMenuDirectlyActivated,
            setInputValue,
            setShowMenu,
            showMenu,
        } = useContext(AutocompleteContext)
        const combinedInputRef = useCombinedRefs(inputRef, forwardedRef)
        const [highlightRemainingText, setHighlightRemainingText] = useState<boolean>(true)

        const handleInputFocus: FocusEventHandler<HTMLInputElement> = (e) => {
            onFocus && onFocus(e)
            setShowMenu && setShowMenu(true)
        }

        const handleInputBlur: FocusEventHandler<HTMLInputElement> = (e) => {
            onBlur && onBlur(e)

            // HACK: wait a tick and check the focused element before hiding the autocomplete menu
            // this prevents the menu from hiding when the user is clicking an option in the Autoselect.Menu,
            // but still hides the menu when the user blurs the input by tabbing out or clicking somewhere else on the page
            // COLEHELP
            setTimeout(() => {
                if (document.activeElement !== combinedInputRef.current) {
                    setShowMenu && setShowMenu(false)
                }
            }, 0)
        }

        const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
            onChange && onChange(e)
            setInputValue && setInputValue(e.currentTarget.value)

            if (!showMenu) {
                setShowMenu && setShowMenu(true)
            }
        }

        const handleInputKeyDown: KeyboardEventHandler = (e) => {
            if (e.key === 'Backspace') {
                setHighlightRemainingText(false)
            }
        }

        const handleInputKeyUp: KeyboardEventHandler = (e) => {
            if (e.key === 'Backspace') {
                setHighlightRemainingText(true)
            }
        }

        const onInputKeyPress: KeyboardEventHandler = useCallback(
            event => {
                if (activeDescendantRef && event.key === 'Enter' && activeDescendantRef.current) {
                    event.preventDefault()
                    event.nativeEvent.stopImmediatePropagation()

                    // Forward Enter key press to active descendant so that item gets activated
                    const activeDescendantEvent = new KeyboardEvent(event.type, event.nativeEvent)
                    activeDescendantRef.current.dispatchEvent(activeDescendantEvent)
                }
            },
            [activeDescendantRef]
        )

        useEffect(() => {
            if (!inputRef?.current) {
                return
            }

            // resets input value to being empty after a selection has been made
            if (!autocompleteSuggestion) {
                inputRef.current.value = inputValue
            }

            // TODO: fix bug where this function prevents `onChange` from being triggered if the highlighted item text
            //       is the same as what I'm typing
            //       e.g.: typing 'tw' highights 'two', but when I 'two', the text input change does not get triggered
            // COLEHELP
            if (highlightRemainingText && autocompleteSuggestion && (inputValue || isMenuDirectlyActivated)) {
                inputRef.current.value = autocompleteSuggestion

                if (autocompleteSuggestion.toLowerCase().indexOf(inputValue.toLowerCase()) === 0) {
                    inputRef.current.setSelectionRange(inputValue.length, autocompleteSuggestion.length)
                }
            }
        }, [autocompleteSuggestion, inputValue])

        useEffect(() => {
            if (value) {
                setInputValue && setInputValue(value.toString())
            }
        }, [value])

        return (
            <Component
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onKeyPress={onInputKeyPress}
                onKeyUp={handleInputKeyUp}
                ref={combinedInputRef}
                aria-controls={`${id}-listbox`}
                aria-autocomplete="both"
                role="combobox"
                aria-expanded={showMenu}
                aria-haspopup="listbox"
                aria-owns={`${id}-listbox`}
                {...props}
            />
        )
    }
) as Polymorphic.ForwardRefComponent<"input", InternalAutocompleteInputProps>

export type AutocompleteInputProps = ComponentProps<typeof AutocompleteInput>
export default AutocompleteInput
