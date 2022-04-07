export const createElement =
  (
    type: HTMLElementTagName,
    props: { [key: string]: JSXPropsValueType },
    ...children: (TidactElement | string)[]
  ): TidactElement =>
    ({
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === 'string' ?
            createTextElement(child) :
            child,
        ),
      },
    })

const createTextElement =
  (text: string): TextTidactElement =>
    ({
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: text,
      },
    })
